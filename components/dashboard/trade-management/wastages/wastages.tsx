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
import { DialogFooter } from '@/components/ui/dialog'
import { ArrowUpDown, Search, Trash2 } from 'lucide-react'
import type { CreateWastageType, GetWastageType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { formatDate, formatNumber } from '@/utils/conversions'
import { useAddWastage, useGetItems, useGetWastages } from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { Popup } from '@/utils/popup'
import { Textarea } from '@/components/ui/textarea'

const Wastages = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  console.log('🚀 ~ Wastages ~ userData:', userData?.userId)
  const [token] = useAtom(tokenAtom)

  const { data: wastages } = useGetWastages()
  const { data: rawItems } = useGetItems()
  const items = rawItems?.data || []

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetWastageType>('wastageDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const [formData, setFormData] = useState<CreateWastageType>({
    itemId: null,
    quantity: 0,
    sellPrice: 0,
    netPrice: 0,
    wastageDate: new Date().toISOString().split('T')[0],
    notes: '',
    createdBy: userData?.userId || 0,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }))
    } else if (type === 'date') {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    const selectedItemId = Number(value)
    setFormData((prev) => ({ ...prev, [name]: selectedItemId }))

    if (name === 'itemId') {
      const selectedItem = items.find((item) => item.itemId === selectedItemId)
      if (selectedItem) {
        setFormData((prev) => ({
          ...prev,
          sellPrice: selectedItem.sellPrice || 0,
        }))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      itemId: null,
      quantity: 0,
      sellPrice: 0,
      netPrice: 0,
      wastageDate: new Date().toISOString().split('T')[0],
      notes: '',
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setError(null)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddWastage({ onClose: closePopup, reset: resetForm })

  const handleSort = (column: keyof GetWastageType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredWastages = useMemo(() => {
    if (!wastages?.data) return []
    return wastages.data?.filter((wastage: GetWastageType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        wastage.itemName?.toLowerCase().includes(searchLower) ||
        wastage.sellPrice?.toString().includes(searchLower) ||
        wastage.netPrice?.toString().includes(searchLower) ||
        wastage.notes?.toString().includes(searchLower) ||
        wastage.quantity?.toString().includes(searchLower)
      )
    })
  }, [wastages, searchTerm])

  const sortedWastages = useMemo(() => {
    return [...filteredWastages].sort((a, b) => {
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
  }, [filteredWastages, sortColumn, sortDirection])

  const paginatedWastages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedWastages.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedWastages, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedWastages.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (formData.quantity <= 0) {
      setError('Please enter a valid quantity')
      return
    }
    if (formData.netPrice < 0) {
      setError('Please enter a valid net price')
      return
    }

    try {
      mutation.mutate(formData)
    } catch (err) {
      setError('Failed to create wastage record')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding wastage')
  }, [mutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Trash2 className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Wastages</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search wastages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
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
                onClick={() => handleSort('sellPrice')}
                className="cursor-pointer"
              >
                Sell Price <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('netPrice')}
                className="cursor-pointer"
              >
                Net Price <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('wastageDate')}
                className="cursor-pointer"
              >
                Transaction Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('notes')}
                className="cursor-pointer"
              >
                Notes <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!wastages ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading wastages...
                </TableCell>
              </TableRow>
            ) : wastages.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No wastages found
                </TableCell>
              </TableRow>
            ) : paginatedWastages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No wastages match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedWastages.map((wastage) => (
                <TableRow key={wastage.wastageId}>
                  <TableCell>{wastage.itemName}</TableCell>
                  <TableCell>{formatNumber(wastage.quantity)}</TableCell>
                  <TableCell>
                    {formatNumber(wastage.sellPrice.toFixed(2))}
                  </TableCell>
                  <TableCell>
                    {formatNumber(wastage.netPrice.toFixed(2))}
                  </TableCell>
                  <TableCell>
                    {formatDate(new Date(wastage.wastageDate))}
                  </TableCell>
                  <TableCell>{wastage.notes}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedWastages.length > 0 && (
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

      {/* Add Wastage Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Add Wastage"
        size="sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Item */}
            <div className="space-y-2">
              <Label htmlFor="itemId">Item</Label>
              <CustomCombobox
                items={
                  items?.map((item) => ({
                    id: item?.itemId?.toString() || '0',
                    name: item.itemName || 'Unnamed item',
                  })) || []
                }
                value={
                  formData.itemId
                    ? {
                        id: formData.itemId.toString(),
                        name:
                          items?.find((i) => i.itemId === formData.itemId)
                            ?.itemName || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange('itemId', value ? String(value.id) : '0')
                }
                placeholder="Select item"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity*</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Sells Price (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="sellPrice">Sell Price</Label>
              <Input
                id="sellPrice"
                name="sellPrice"
                type="number"
                step="0.01"
                value={formData.sellPrice}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Net Price */}
            <div className="space-y-2">
              <Label htmlFor="netPrice">Net Price*</Label>
              <Input
                id="netPrice"
                name="netPrice"
                type="number"
                step="0.01"
                value={formData.sellPrice * formData.quantity}
                disabled
                placeholder="Enter net price"
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Transaction Date */}
            <div className="space-y-2">
              <Label htmlFor="wastageDate">Transaction Date*</Label>
              <Input
                id="wastageDate"
                name="wastageDate"
                type="date"
                value={formData.wastageDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any remarks or notes"
                className="w-full border border-input bg-background rounded-md p-2 min-h-[80px] text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </Popup>
    </div>
  )
}

export default Wastages
