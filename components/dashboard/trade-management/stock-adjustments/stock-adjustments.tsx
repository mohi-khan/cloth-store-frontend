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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpDown, Search, ArrowRightLeft } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type {
  CreateStockAdjustmentType,
  GetStockAdjustmentType,
} from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import formatDate from '@/utils/formatDate'
import {
  useAddStockAdjustment,
  useGetStockAdjustments,
  useGetItems,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const StockAdjustment = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: adjustments } = useGetStockAdjustments()
  const { data: rawItems } = useGetItems()
  const items = rawItems?.data || []

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetStockAdjustmentType>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const [formData, setFormData] = useState<CreateStockAdjustmentType>({
    prevItemId: null,
    newItemId: null,
    quantity: 1,
    createdBy: userData?.userId || 0,
  })

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : null }))
  }

  const resetForm = () => {
    setFormData({
      prevItemId: null,
      newItemId: null,
      quantity: 1,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setError(null)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddStockAdjustment({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSort = (column: keyof GetStockAdjustmentType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredAdjustments = useMemo(() => {
    if (!adjustments?.data) return []
    return adjustments.data.filter((adjustment: GetStockAdjustmentType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        adjustment.prevItemName?.toLowerCase().includes(searchLower) ||
        adjustment.newItemName?.toLowerCase().includes(searchLower) ||
        adjustment.quantity?.toString().includes(searchLower)
      )
    })
  }, [adjustments?.data, searchTerm])

  const sortedAdjustments = useMemo(() => {
    return [...filteredAdjustments].sort((a, b) => {
      const aValue = a[sortColumn] ?? ''
      const bValue = b[sortColumn] ?? ''

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      const isDate = (val: unknown) =>
        typeof val === 'string' && !isNaN(Date.parse(val))

      if (isDate(aValue) && isDate(bValue)) {
        const aTime = new Date(aValue).getTime()
        const bTime = new Date(bValue).getTime()
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
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
  }, [filteredAdjustments, sortColumn, sortDirection])

  const paginatedAdjustments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAdjustments.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAdjustments, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedAdjustments.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.quantity || formData.quantity <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    try {
      mutation.mutate(formData)
    } catch (err) {
      setError('Failed to create stock adjustment')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding stock adjustment')
  }, [mutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <ArrowRightLeft className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Stock Adjustments</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search adjustments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-black"
            onClick={() => setIsPopupOpen(true)}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('prevItemName')}
                className="cursor-pointer"
              >
                Previous Item <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('newItemName')}
                className="cursor-pointer"
              >
                New Item <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('quantity')}
                className="cursor-pointer"
              >
                Quantity <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('createdAt')}
                className="cursor-pointer"
              >
                Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!adjustments?.data ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading adjustments...
                </TableCell>
              </TableRow>
            ) : adjustments.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No stock adjustments found
                </TableCell>
              </TableRow>
            ) : paginatedAdjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No adjustments match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedAdjustments.map((adjustment) => (
                <TableRow key={adjustment.adjustmentId}>
                  <TableCell>{adjustment.prevItemName || '-'}</TableCell>
                  <TableCell>{adjustment.newItemName || '-'}</TableCell>
                  <TableCell>{adjustment.quantity}</TableCell>
                  <TableCell>
                    {adjustment.createdAt
                      ? formatDate(new Date(adjustment.createdAt))
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedAdjustments.length > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                if (
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 2 && index <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={`page-${index}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  index === currentPage - 3 ||
                  index === currentPage + 3
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add Stock Adjustment Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Add Stock Adjustment"
        size="sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* From Item (Transfer & Remove) */}
            <div className="space-y-2">
              <Label htmlFor="prevItemId">Previous Item</Label>
              <CustomCombobox
                items={
                  items?.map((item) => ({
                    id: item?.itemId?.toString() || '0',
                    name: item.itemName || 'Unnamed item',
                  })) || []
                }
                value={
                  formData.prevItemId && formData.prevItemId > 0
                    ? {
                        id: formData.prevItemId.toString(),
                        name:
                          items?.find((i) => i.itemId === formData.prevItemId)
                            ?.itemName || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange(
                    'prevItemId',
                    value ? String(value.id) : '0'
                  )
                }
                placeholder="Select item"
              />
            </div>

            {/* To Item (Transfer & Add) */}
            <div className="space-y-2">
              <Label htmlFor="newItemId">New Item</Label>
              <CustomCombobox
                items={
                  items?.map((item) => ({
                    id: item?.itemId?.toString() || '0',
                    name: item.itemName || 'Unnamed item',
                  })) || []
                }
                value={
                  formData.newItemId && formData.newItemId > 0
                    ? {
                        id: formData.newItemId.toString(),
                        name:
                          items?.find((i) => i.itemId === formData.newItemId)
                            ?.itemName || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange(
                    'newItemId',
                    value ? String(value.id) : '0'
                  )
                }
                placeholder="Select item"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="quantity">Quantity*</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleInputChange}
                required
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
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default StockAdjustment
