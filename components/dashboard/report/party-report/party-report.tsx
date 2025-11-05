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
import { Input } from '@/components/ui/input'
import formatDate from '@/utils/formatDate'
import { File, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useGetPartyReport, useGetCustomers } from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const PartyReport = () => {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  )
  const [showLogoInPdf, setShowLogoInPdf] = useState(false)

  const { data: customers } = useGetCustomers()

  const { data: partyReports } = useGetPartyReport(
    fromDate,
    toDate,
    selectedCustomerId || 0
  )

  const exportToExcel = () => {
    const flatData = partyReports?.data?.map((report) => ({
      Date: formatDate(new Date(report.date)),
      Particular: report.particular || 'N/A',
      Amount: report.amount,
    }))

    const worksheet = XLSX.utils.json_to_sheet(flatData as any[])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `Party Report`)

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })

    saveAs(blob, `party-report.xlsx`)
  }

  const generatePdf = async () => {
    const targetRef = document.getElementById('party-report-content')
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

    const customerName =
      customers?.data?.find((c) => c.customerId === selectedCustomerId)?.name ||
      'N/A'

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(12)
      pdf.setFont('bold')
      pdf.text('Cloth Store Management System', leftTextMargin, 35)

      pdf.setFontSize(10)
      const baseText = `Party Report from ${fromDate} to ${toDate} - ${customerName} ( Date : `
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

    pdf.save(`party-report-${fromDate}-to-${toDate}.pdf`)
    setShowLogoInPdf(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Party Report</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToExcel}
            variant="ghost"
            className="flex items-center gap-2 bg-green-100 text-green-900 hover:bg-green-200"
            disabled={!selectedCustomerId || partyReports?.data?.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button
            onClick={generatePdf}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 print:hidden"
            disabled={!selectedCustomerId || partyReports?.data?.length === 0}
          >
            <File className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-start gap-4 mb-4 print:hidden flex-wrap">
        <div className="flex items-center gap-2">
          <Label htmlFor="customer" className="text-sm font-medium">
            Party*
          </Label>
          <CustomCombobox
            items={
              customers?.data?.map((customer) => ({
                id: customer?.customerId?.toString() || '0',
                name: customer.name || 'Unnamed customer',
              })) || []
            }
            value={
              selectedCustomerId
                ? {
                    id: selectedCustomerId.toString(),
                    name:
                      customers?.data?.find(
                        (c) => c.customerId === selectedCustomerId
                      )?.name || '',
                  }
                : null
            }
            onChange={(value) =>
              setSelectedCustomerId(value ? Number(value.id) : null)
            }
            placeholder="Select customer"
          />
        </div>

        {/* Date filters */}
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
        <div className="flex items-center gap-4"></div>
      </div>

      {/* Report Content */}
      <div id="party-report-content" className="space-y-6">
        {!selectedCustomerId ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              Please select a customer to view the party report
            </CardContent>
          </Card>
        ) : partyReports?.data?.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              No transactions found for the selected customer and date range
              {!fromDate || !toDate ? (
                <p className="text-sm mt-2 text-amber-600">
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
                  <TableHeader className="bg-amber-100 pdf-table-header">
                    <TableRow>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Particular</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partyReports?.data?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          {formatDate(new Date(report.date))}
                        </TableCell>
                        <TableCell>{report.particular}</TableCell>
                        <TableCell>{report.amount}</TableCell>
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

export default PartyReport
