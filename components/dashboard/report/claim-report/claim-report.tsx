'use client'

import {
  useGetEmployee,
  useGetEmployeeClaimsReport,
  useGetEmployeesBySearch,
} from '@/hooks/use-api'
import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import formatDate from '@/utils/formatDate'
import { File, FileSpreadsheet, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { EmployeeClaimReportType } from '@/utils/type'
import { CustomCombobox } from '@/utils/custom-combobox'
import {
  ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'

const CLAIM_TYPES = [
  { id: 'Travel', name: 'Travel' },
  { id: 'Medicine', name: 'Medicine' },
  { id: 'Hospital', name: 'Hospital' },
  { id: 'Mobile Handset', name: 'Mobile Handset' },
]

const ClaimReport = () => {
  const [selectedFromDate, setSelectedFromDate] = useState('')
  const [selectedToDate, setSelectedToDate] = useState('')
  const [selectedEmpId, setSelectedEmpId] = useState(0)
  const [selectedClaimType, setSelectedClaimType] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const { data: employees } = useGetEmployeesBySearch(search)
  console.log('🚀 ~ TravelClaims ~ employees:', employees)

  // const { data: employees } = useGetEmployee()
  const { data: employeeClaims } = useGetEmployeeClaimsReport(
    selectedFromDate,
    selectedToDate,
    selectedEmpId || 0
  )
  console.log('🚀 ~ ClaimReport ~ employeeClaims:', employeeClaims)

  const filteredClaims = useMemo(() => {
    if (!employeeClaims?.data) return []

    let filteredData = employeeClaims.data

    if (selectedEmpId > 0) {
      filteredData = filteredData.filter(
        (claim: EmployeeClaimReportType) => claim.empId === selectedEmpId
      )
    }

    if (selectedClaimType) {
      filteredData = filteredData.filter(
        (claim: EmployeeClaimReportType) =>
          claim.claimType === selectedClaimType
      )
    }

    // Filter by date range if specified
    if (selectedFromDate || selectedToDate) {
      filteredData = filteredData.filter((claim: EmployeeClaimReportType) => {
        const claimDate = new Date(claim.claimDate)
        const fromDate = selectedFromDate ? new Date(selectedFromDate) : null
        const toDate = selectedToDate ? new Date(selectedToDate) : null

        if (fromDate && claimDate < fromDate) return false
        if (toDate && claimDate > toDate) return false
        return true
      })
    }

    return filteredData
  }, [
    employeeClaims,
    selectedFromDate,
    selectedToDate,
    selectedEmpId,
    selectedClaimType,
  ]) // Added selectedClaimType to dependency array

  const exportToExcel = () => {
    // Calculate total balance (ignore null/undefined balances)
    const totalClaimAmount = filteredClaims.reduce((sum, claim) => {
      return sum + (claim.balance ?? 0)
    }, 0)

    const flatData = filteredClaims.map((claim: EmployeeClaimReportType) => {
      const baseData = {
        'Employee Code': claim.employeeCode,
        'Employee Name': claim.employeeName,
        Designation: claim.designation,
        Department: claim.department,
        Company: claim.companyName,
        'Claim Date': formatDate(new Date(claim.claimDate)),
        'Posting Date': formatDate(new Date(claim.postingDate)),
        'Claim Amount': claim.claimAmount ?? 'N/A',
      }

      // Only include claim type column if no specific claim type is selected
      if (!selectedClaimType) {
        return {
          'Claim Type': claim.claimType,
          ...baseData,
        }
      }

      return baseData
    })

    // Add total row at the end
    const totalRow: any = {
      'Employee Code': '',
      'Employee Name': '',
      Designation: '',
      Department: '',
      Company: '',
      'Claim Date': '',
      'Posting Date': 'Total',
      'Claim Amount': totalClaimAmount,
    }

    if (!selectedClaimType) {
      totalRow['Claim Type'] = ''
    }

    flatData.push(totalRow)

    const worksheet = XLSX.utils.json_to_sheet(flatData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Claims Report')

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })

    // Dynamic filename based on claim type selection
    const filename = selectedClaimType
      ? `employee-${selectedClaimType.toLowerCase().replace(' ', '-')}-claims-report.xlsx`
      : 'employee-claims-report.xlsx'

    saveAs(blob, filename)
  }

  const generatePdf = async () => {
    const targetRef = document.getElementById('claims-report-content')
    if (!targetRef) return

    setLoading(true)
    await new Promise((res) => setTimeout(res, 200))

    const canvas = await html2canvas(targetRef, {
      scale: 2,
      useCORS: true,
    })

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const marginTop = 70
    const marginBottom = 40
    const horizontalPadding = 30
    const usablePageHeight = pageHeight - marginTop - marginBottom

    const imgWidth = pageWidth - horizontalPadding * 2
    const scale = imgWidth / canvas.width

    let heightLeftPx = canvas.height
    let sourceY = 0
    let pageCount = 0

    while (heightLeftPx > 0) {
      const sliceHeightPx = Math.min(heightLeftPx, usablePageHeight / scale)

      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      tempCanvas.width = canvas.width
      tempCanvas.height = sliceHeightPx

      tempCtx?.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      )

      const imgDataSlice = tempCanvas.toDataURL('image/jpeg')

      if (pageCount > 0) {
        pdf.addPage()
      }

      pdf.addImage(
        imgDataSlice,
        'JPEG',
        horizontalPadding,
        marginTop,
        imgWidth,
        sliceHeightPx * scale
      )

      heightLeftPx -= sliceHeightPx
      sourceY += sliceHeightPx
      pageCount++
    }

    const leftTextMargin = horizontalPadding
    const totalPages = pdf.internal.pages.length - 1

    const today = new Date()
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(12)
      pdf.setFont('bold')
      pdf.text(
        `Employee ${selectedClaimType.replace(' ', '-')} Claims Report`,
        leftTextMargin,
        35
      )

      pdf.setFontSize(10)
      pdf.setFont('normal')
      pdf.text(`Generated on: ${formattedDate}`, leftTextMargin, 50)

      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - horizontalPadding - 50,
        pageHeight - marginBottom + 20
      )
    }

    // Dynamic filename based on claim type selection
    const filename = selectedClaimType
      ? `employee-${selectedClaimType.toLowerCase().replace(' ', '-')}-claims-report.pdf`
      : 'employee-claims-report.pdf'

    pdf.save(filename)
    setLoading(false)
  }

  const items: ComboboxItem[] =
    employees?.data?.map((emp: any) => ({
      id: emp?.id !== undefined ? emp.id.toString() : '',
      name: `${emp.empId} - ${emp.name} - ${emp.designationName} - ${emp.departmentName}`,
    })) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employee Claims Report</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToExcel}
            variant="ghost"
            className="flex items-center gap-2 bg-green-100 text-green-900 hover:bg-green-200"
            disabled={filteredClaims.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button
            onClick={generatePdf}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100"
            disabled={filteredClaims.length === 0 || loading}
          >
            <File className="h-4 w-4" />
            {loading ? 'Generating...' : 'PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="from-date" className="text-sm font-medium">
              From Date:
            </Label>
            <Input
              id="from-date"
              type="date"
              value={selectedFromDate}
              onChange={(e) => setSelectedFromDate(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="to-date" className="text-sm font-medium">
              To Date:
            </Label>
            <Input
              id="to-date"
              type="date"
              value={selectedToDate}
              onChange={(e) => setSelectedToDate(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Employee:</Label>
            {/* <CustomCombobox
              items={
                employees?.data
                  ?.filter((employee: any) => employee.id !== undefined)
                  .map((employee: any) => ({
                    id: employee.id.toString(),
                    name:
                        `${employee.empId} - ${employee.name} - ${employee.designationName} - ${employee.departmentName}` ||
                        'Unnamed employee',
                  })) || []
              }
              value={
                selectedEmpId > 0
                  ? {
                      id: selectedEmpId.toString(),
                      name:
                        employees?.data?.find(
                          (e: any) => e.id === selectedEmpId
                        )?.name || '',
                    }
                  : null
              }
              onChange={(value) =>
                setSelectedEmpId(value ? Number.parseInt(value.id) : 0)
              }
              placeholder="All employees"
              /> */}
            <CustomComboboxWithApi<ComboboxItem>
              items={items}
              value={
                selectedEmpId
                  ? (() => {
                      const emp = employees?.data?.find(
                        (e: any) => e.id === selectedEmpId
                      )
                      return emp
                        ? {
                            id: emp?.id?.toString() ?? '',
                            name: `${emp.empId} - ${emp.name} - ${emp.designationName} - ${emp.departmentName}`,
                          }
                        : { id: selectedEmpId.toString(), name: '' }
                    })()
                  : null
              }
              onChange={(item) => {
                if (!item) {
                  setSelectedEmpId(0)
                  return
                }

                setSelectedEmpId(Number(item.id))
              }}
              placeholder="Select employee"
              searchFunction={async (query: string) => {
                setSearch(query) // 👈 triggers new search
                return items
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Claim Type:</Label>
            <CustomCombobox
              items={CLAIM_TYPES}
              value={
                selectedClaimType
                  ? {
                      id: selectedClaimType,
                      name: selectedClaimType,
                    }
                  : null
              }
              onChange={(value) => setSelectedClaimType(value ? value.id : '')}
              placeholder="All claim types"
            />
          </div>
        </div>
      </div>

      <div id="claims-report-content" className="space-y-6">
        {filteredClaims.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No claims found for the selected criteria</p>
              <p className="text-sm mt-2 text-gray-400">
                Try adjusting your filters or date range
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      {!selectedClaimType && (
                        <TableHead className="font-bold">Claim Type</TableHead>
                      )}
                      <TableHead className="font-bold">Employee Code</TableHead>
                      <TableHead className="font-bold">Employee Name</TableHead>
                      <TableHead className="font-bold">Designation</TableHead>
                      <TableHead className="font-bold">Department</TableHead>
                      <TableHead className="font-bold">Company</TableHead>
                      <TableHead className="font-bold">Claim Date</TableHead>
                      <TableHead className="font-bold">Posting Date</TableHead>
                      <TableHead className="font-bold">Claim Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim, index) => (
                      <TableRow key={index}>
                        {!selectedClaimType && (
                          <TableCell>{claim.claimType}</TableCell>
                        )}
                        <TableCell>{claim.employeeCode}</TableCell>
                        <TableCell>{claim.employeeName}</TableCell>
                        <TableCell>{claim.designation}</TableCell>
                        <TableCell>{claim.department}</TableCell>
                        <TableCell>{claim.companyName}</TableCell>
                        <TableCell>
                          {formatDate(new Date(claim.claimDate))}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(claim.postingDate))}
                        </TableCell>
                        <TableCell>
                          {claim.claimAmount
                            ? claim.claimAmount.toFixed(2)
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ClaimReport
