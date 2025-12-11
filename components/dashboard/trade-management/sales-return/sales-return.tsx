'use client'

import type React from 'react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown, Search, RotateCcw } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type {
  CreateSalesReturnType,
  GetSalesMasterType,
  GetSaleDetailsType,
} from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { formatDate, formatNumber } from '@/utils/conversions'
import {
  useGetSalesMaster,
  useGetSalesDetailsBySalesMasterId,
  useAddSalesReturn,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const SalesReturn = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: salesMasters } = useGetSalesMaster()
  console.log('🚀 ~ SalesReturn ~ salesMasters:', salesMasters)
  const [selectedSalesMasterId, setSelectedSalesMasterId] = useState<number>(0)
  const { data: salesDetails } = useGetSalesDetailsBySalesMasterId(
    selectedSalesMasterId
  )

  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] =
    useState<keyof GetSaleDetailsType>('itemName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedSaleDetail, setSelectedSaleDetail] =
    useState<GetSaleDetailsType | null>(null)

  const [formData, setFormData] = useState<CreateSalesReturnType>({
    saleDetailsId: 0,
    returnQuantity: 0,
    createdBy: userData?.userId || 0,
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      createdBy: userData?.userId || 0,
    }))
  }, [userData?.userId])

  const handleSelectSalesMaster = (
    value: { id: string; name: string } | null
  ) => {
    if (value) {
      setSelectedSalesMasterId(Number(value.id))
      setSelectedSaleDetail(null)
      setFormData({
        saleDetailsId: 0,
        returnQuantity: 0,
        createdBy: userData?.userId || 0,
      })
    } else {
      setSelectedSalesMasterId(0)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const resetForm = useCallback(() => {
    setFormData({
      saleDetailsId: 0,
      returnQuantity: 0,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setError(null)
    setSelectedSaleDetail(null)
  }, [userData?.userId])

  const closePopup = useCallback(() => {
    resetForm()
  }, [resetForm])

  const mutation = useAddSalesReturn({ onClose: closePopup, reset: resetForm })

  const handleOpenReturnPopup = (saleDetail: GetSaleDetailsType) => {
    setSelectedSaleDetail(saleDetail)
    setFormData({
      saleDetailsId: saleDetail.saleDetailsId || 0,
      returnQuantity: 0,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  const handleSort = (column: keyof GetSaleDetailsType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredSalesDetails = useMemo(() => {
    if (!salesDetails?.data) return []
    return salesDetails.data.filter((detail: GetSaleDetailsType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        detail.itemName?.toLowerCase().includes(searchLower) ||
        detail.quantity?.toString().includes(searchLower) ||
        detail.unitPrice?.toString().includes(searchLower) ||
        detail.amount?.toString().includes(searchLower)
      )
    })
  }, [salesDetails?.data, searchTerm])

  const sortedSalesDetails = useMemo(() => {
    return [...filteredSalesDetails].sort((a, b) => {
      const aValue = a[sortColumn] ?? ''
      const bValue = b[sortColumn] ?? ''

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredSalesDetails, sortColumn, sortDirection])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.saleDetailsId || formData.saleDetailsId === 0) {
      setError('Sale detail not selected')
      return
    }
    if (!formData.returnQuantity || formData.returnQuantity <= 0) {
      setError('Please enter a valid return quantity')
      return
    }
    if (
      selectedSaleDetail &&
      formData.returnQuantity > selectedSaleDetail.quantity
    ) {
      setError(
        `Return quantity cannot exceed sale quantity (${selectedSaleDetail.quantity})`
      )
      return
    }

    try {
      mutation.mutate(formData)
    } catch (err) {
      setError('Failed to create sales return')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding sales return')
  }, [mutation.error])

  const selectedSalesMaster = salesMasters?.data?.find(
    (sm) => sm.saleMasterId === selectedSalesMasterId
  ) as GetSalesMasterType | undefined

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <RotateCcw className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Sales Return</h2>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center justify-start gap-4 mb-4 w-1/4 flex-nowrap">
          <Label htmlFor="salesMasterId" className="text-sm font-medium">
            Sale
          </Label>
          <CustomCombobox
            items={
              salesMasters?.data?.map((sm) => ({
                id: sm.saleMasterId?.toString() || '0',
                name: `${sm.customerName} - ${formatNumber(sm.totalAmount.toFixed(2))} - ${formatDate(sm.saleDate)}`,
              })) || []
            }
            value={
              selectedSalesMasterId > 0 && selectedSalesMaster
                ? {
                    id: selectedSalesMasterId.toString(),
                    name: `${selectedSalesMaster.customerName} - ${formatNumber(selectedSalesMaster.totalAmount.toFixed(2))} - ${formatDate(selectedSalesMaster.saleDate)}`,
                  }
                : null
            }
            onChange={handleSelectSalesMaster}
            placeholder="Select a sale"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Sales Details Table */}
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-amber-100">
              <TableRow>
                <TableHead
                  onClick={() => handleSort('itemName')}
                  className="cursor-pointer"
                >
                  Item Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('quantity')}
                  className="cursor-pointer"
                >
                  Quantity <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('unitPrice')}
                  className="cursor-pointer"
                >
                  Unit Price <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort('amount')}
                  className="cursor-pointer"
                >
                  Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!salesDetails?.data ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Please select a sale
                  </TableCell>
                </TableRow>
              ) : salesDetails.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No sale details found
                  </TableCell>
                </TableRow>
              ) : sortedSalesDetails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No items match your search
                  </TableCell>
                </TableRow>
              ) : (
                sortedSalesDetails.map((detail) => (
                  <TableRow key={detail.saleDetailsId}>
                    <TableCell>{detail.itemName}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>
                      {formatNumber(detail.unitPrice.toFixed(2))}
                    </TableCell>
                    <TableCell>
                      {formatNumber(detail.amount.toFixed(2))}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReturnPopup(detail)}
                        className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                      >
                        Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Return Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Create Sales Return"
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            {/* Item Name (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={selectedSaleDetail?.itemName || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Sale Quantity (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="saleQuantity">Sale Quantity</Label>
              <Input
                id="saleQuantity"
                value={selectedSaleDetail?.quantity || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Unit Price (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                value={formatNumber(
                  (selectedSaleDetail?.unitPrice || 0).toFixed(2)
                )}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Return Quantity */}
            <div className="space-y-2">
              <Label htmlFor="returnQuantity">Return Quantity*</Label>
              <Input
                id="returnQuantity"
                name="returnQuantity"
                type="number"
                min="1"
                max={selectedSaleDetail?.quantity || 0}
                step="1"
                value={formData.returnQuantity || ''}
                onChange={handleInputChange}
                required
                placeholder="Enter quantity to return"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Return'}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default SalesReturn
