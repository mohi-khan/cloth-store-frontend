'use client'

import { useGetBirthdayReport } from '@/hooks/use-api'
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
import { File, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const BirthdayReport = () => {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [showLogoInPdf, setShowLogoInPdf] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: birthdays } = useGetBirthdayReport(fromDate, toDate)

  const sortedBirthdays = useMemo(() => {
    if (!birthdays?.data) return []

    return [...birthdays.data].sort((a, b) => {
      if (!a.dateOfBirth && !b.dateOfBirth) return 0
      if (!a.dateOfBirth) return 1
      if (!b.dateOfBirth) return -1

      const dayA = new Date(a.dateOfBirth).getDate()
      const dayB = new Date(b.dateOfBirth).getDate()

      return dayA - dayB
    })
  }, [birthdays])

  const exportToExcel = () => {
    const flatData = sortedBirthdays.map((birthday) => ({
      'Employee ID': birthday.empId,
      Name: birthday.name,
      'Mobile No.': birthday.mobileNumber,
      Designation: birthday.designation,
      'Date of Birth': birthday.dateOfBirth
        ? formatDate(birthday.dateOfBirth)
        : 'N/A',
      'Date of Joining': formatDate(birthday.dateOfJoining),
      Company: birthday.companyName,
      Department: birthday.department,
      Location: birthday.location,
    }))

    const worksheet = XLSX.utils.json_to_sheet(flatData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Birthday Report ${fromDate} to ${toDate}`
    )

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })

    saveAs(blob, `birthday-report-${fromDate}-to-${toDate}.xlsx`)
  }

  const generatePdf = async () => {
    const targetRef = document.getElementById('birthday-report-content')
    if (!targetRef) return

    setShowLogoInPdf(true)
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
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
    const monthName = today.toLocaleDateString('en-US', { month: 'long' })
    const day = today.getDate()
    const year = today.getFullYear()

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(12)
      pdf.setFont('bold')
      pdf.text(
        'M.M.Ispahani Ltd / Subsidiary and Sister Companies',
        leftTextMargin,
        35
      )

      pdf.setFontSize(10)
      const baseText = `Birthday Report from ${fromDate} to ${toDate} ( Date : `
      pdf.setFont('bold')
      pdf.text(baseText, leftTextMargin, 50)
      let currentX = leftTextMargin + pdf.getTextWidth(baseText)
      pdf.text(dayName, currentX, 50)
      currentX += pdf.getTextWidth(dayName)
      pdf.text(', ', currentX, 50)
      currentX += pdf.getTextWidth(', ')
      pdf.text(monthName, currentX, 50)
      currentX += pdf.getTextWidth(monthName)
      pdf.text(` ${day}, ${year} )`, currentX, 50)

      pdf.setFontSize(10)
      pdf.setFont('normal')
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - horizontalPadding - 50,
        pageHeight - marginBottom + 20
      )
    }

    pdf.save(`birthday-report-${fromDate}-to-${toDate}.pdf`)
    setShowLogoInPdf(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Birthday Report</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToExcel}
            variant="ghost"
            className="flex items-center gap-2 bg-green-100 text-green-900 hover:bg-green-200"
            disabled={sortedBirthdays.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button
            onClick={generatePdf}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 print:hidden"
            disabled={sortedBirthdays.length === 0}
          >
            <File className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="from-date" className="text-sm font-medium">
              From Date:
            </Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="to-date" className="text-sm font-medium">
              To Date:
            </Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      <div id="birthday-report-content" className="space-y-6">
        {loading ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center">
              <p>Loading birthdays...</p>
            </CardContent>
          </Card>
        ) : sortedBirthdays.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              No birthdays found for the selected date range
              {!fromDate || !toDate ? (
                <p className="text-sm mt-2 text-blue-600">
                  Please select both from and to dates
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-200 pdf-table-header">
                    <TableRow>
                      <TableHead className="font-bold">Employee ID</TableHead>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Mobile No.</TableHead>
                      <TableHead className="font-bold">Designation</TableHead>
                      <TableHead className="font-bold">Date of Birth</TableHead>
                      <TableHead className="font-bold">
                        Date of Joining
                      </TableHead>
                      <TableHead className="font-bold">Company</TableHead>
                      <TableHead className="font-bold">Department</TableHead>
                      <TableHead className="font-bold">Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBirthdays.map((birthday) => (
                      <TableRow key={birthday.empId}>
                        <TableCell className="font-medium">
                          {birthday.empId}
                        </TableCell>
                        <TableCell>{birthday.name}</TableCell>
                        <TableCell>{birthday.mobileNumber}</TableCell>
                        <TableCell>{birthday.designation}</TableCell>
                        <TableCell>
                          {birthday.dateOfBirth
                            ? formatDate(birthday.dateOfBirth)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {formatDate(birthday.dateOfJoining)}
                        </TableCell>
                        <TableCell>{birthday.companyName}</TableCell>
                        <TableCell>{birthday.department}</TableCell>
                        <TableCell>{birthday.location}</TableCell>
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

export default BirthdayReport
