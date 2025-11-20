'use client'

import { useState } from 'react'
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
import { formatDate, formatNumber } from '@/utils/conversions'
import { File, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useGetLoanReport, useGetLoans } from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const LoanReport = () => {
  const [selectedLoanUniqueName, setSelectedLoanUniqueName] = useState<
    string | null
  >(null)
  const [showLogoInPdf, setShowLogoInPdf] = useState(false)

  const { data: loans } = useGetLoans()

  const { data: loanReports } = useGetLoanReport(selectedLoanUniqueName || '')

  const exportToExcel = () => {
    const flatData = loanReports?.data?.map((report) => ({
      Date: formatDate(new Date(report.date)),
      Type: report.type || 'N/A',
      Amount: report.amount,
      Remarks: report.remarks || 'N/A',
    }))

    const worksheet = XLSX.utils.json_to_sheet(flatData as any[])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `Loan Report`)

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })

    saveAs(blob, `loan-report.xlsx`)
  }

  const generatePdf = async () => {
    const targetRef = document.getElementById('loan-report-content')
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

    const selectedLoan = loans?.data?.find(
      (l) => l.uniqueName === selectedLoanUniqueName
    )
    const loanName = selectedLoan
      ? `${selectedLoan.loanId} - ${selectedLoan.uniqueName}`
      : 'N/A'

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(12)
      pdf.setFont('bold')
      pdf.text('Cloth Store Management System', leftTextMargin, 35)

      pdf.setFontSize(10)
      const baseText = `Loan Report - ${loanName} ( Date : `
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

    pdf.save(`loan-report.pdf`)
    setShowLogoInPdf(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loan Report</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToExcel}
            variant="ghost"
            className="flex items-center gap-2 bg-green-100 text-green-900 hover:bg-green-200"
            disabled={!selectedLoanUniqueName || loanReports?.data?.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button
            onClick={generatePdf}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 print:hidden"
            disabled={!selectedLoanUniqueName || loanReports?.data?.length === 0}
          >
            <File className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-start gap-4 mb-4 print:hidden flex-wrap">
        <div className="flex items-center gap-2">
          <Label htmlFor="loan" className="text-sm font-medium">
            Loan
          </Label>
          <CustomCombobox
            items={
              loans?.data?.map((loan) => ({
                id: loan?.uniqueName || '0',
                name: `${loan.loanId} - ${loan.uniqueName}`,
              })) || []
            }
            value={
              selectedLoanUniqueName
                ? {
                    id: selectedLoanUniqueName,
                    name:
                      loans?.data?.find((l) => l.uniqueName === selectedLoanUniqueName)
                        ? `${loans.data.find((l) => l.uniqueName === selectedLoanUniqueName)?.loanId} - ${selectedLoanUniqueName}`
                        : '',
                  }
                : null
            }
            onChange={(value) =>
              setSelectedLoanUniqueName(value ? value.id : null)
            }
            placeholder="Select loan"
          />
        </div>
      </div>

      {/* Report Content */}
      <div id="loan-report-content" className="space-y-6">
        {!selectedLoanUniqueName ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              Please select a loan to view the loan report
            </CardContent>
          </Card>
        ) : loanReports?.data?.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              No transactions found for the selected loan
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader className="bg-amber-100 pdf-table-header">
                    <TableRow>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                      <TableHead className="font-bold">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanReports?.data?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {formatDate(new Date(report.date))}
                        </TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{formatNumber(report.amount)}</TableCell>
                        <TableCell>{report.remarks}</TableCell>
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

export default LoanReport