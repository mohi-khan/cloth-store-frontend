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
import { useGetStockLedger, useGetItems } from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const StockLedger = () => {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<number | 0>(0)
  const [showLogoInPdf, setShowLogoInPdf] = useState(false)

  const { data: items } = useGetItems()

  const { data: stockLedgerData } = useGetStockLedger(
    fromDate,
    toDate,
    selectedItemId || 0
  )

  const exportToExcel = () => {
    const flatData = stockLedgerData?.data?.map((ledger) => ({
      'Item Name': ledger.item_name,
      'Reference Type': ledger.reference_type,
      Reference: ledger.reference || 'N/A',
      Quantity: ledger.quantity,
      'Transaction Date': ledger.transaction_date
        ? formatDate(new Date(ledger.transaction_date))
        : 'N/A',
    }))

    const worksheet = XLSX.utils.json_to_sheet(flatData as any[])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `Stock Ledger`)

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })

    saveAs(blob, `stock-ledger.xlsx`)
  }

  const generatePdf = async () => {
    const targetRef = document.getElementById('stock-ledger-content')
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

    const itemName =
      items?.data?.find((i) => i.itemId === selectedItemId)?.itemName || 'N/A'

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(12)
      pdf.setFont('bold')
      pdf.text('Cloth Store Management System', leftTextMargin, 35)

      pdf.setFontSize(10)
      const baseText = `Stock Ledger from ${fromDate} to ${toDate} - ${itemName} ( Date : `
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

    pdf.save(`stock-ledger-${fromDate}-to-${toDate}.pdf`)
    setShowLogoInPdf(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stock Ledger</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToExcel}
            variant="ghost"
            className="flex items-center gap-2 bg-green-100 text-green-900 hover:bg-green-200"
            disabled={selectedItemId === 0 || !stockLedgerData?.data?.length}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button
            onClick={generatePdf}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 print:hidden"
            disabled={selectedItemId === 0 || !stockLedgerData?.data?.length}
          >
            <File className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-start gap-4 mb-4 print:hidden flex-wrap">
        <div className="flex items-center gap-2">
          <Label htmlFor="item" className="text-sm font-medium">
            Item*
          </Label>
          <CustomCombobox
            items={
              items?.data?.map((item) => ({
                id: item?.itemId?.toString() || '0',
                name: item.itemName || 'Unnamed item',
              })) || []
            }
            value={
              selectedItemId > 0
                ? {
                    id: selectedItemId.toString(),
                    name:
                      items?.data?.find((i) => i.itemId === selectedItemId)
                        ?.itemName || '',
                  }
                : null
            }
            onChange={(value) =>
              setSelectedItemId(value ? Number(value.id) : 0)
            }
            placeholder="Select item"
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
      </div>

      {/* Report Content */}
      <div id="stock-ledger-content" className="space-y-6">
        {selectedItemId === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              Please select an item to view the stock ledger
            </CardContent>
          </Card>
        ) : !stockLedgerData?.data?.length ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center text-gray-500">
              No transactions found for the selected item and date range
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
                      <TableHead className="font-bold">
                        Transaction Date
                      </TableHead>
                      <TableHead className="font-bold">
                        Reference Type
                      </TableHead>
                      <TableHead className="font-bold">Quantity</TableHead>
                      <TableHead className="font-bold">Balance</TableHead>
                      <TableHead className="font-bold">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLedgerData?.data?.map((ledger) => (
                      <TableRow key={ledger.transaction_id}>
                        <TableCell>
                          {ledger.transaction_date
                            ? formatDate(new Date(ledger.transaction_date))
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{ledger.reference_type}</TableCell>
                        <TableCell>{ledger.quantity || 0}</TableCell>
                        <TableCell>{ledger.balance || 0}</TableCell>
                        <TableCell>{ledger.reference || 0}</TableCell>
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

export default StockLedger
