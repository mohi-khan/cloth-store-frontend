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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpDown, Search, ShoppingCart } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type { CreatePurchaseType, GetPurchaseType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import formatDate from '@/utils/formatDate'
import {
  useAddPurchase,
  useGetBankAccounts,
  useGetItems,
  useGetPurchases,
  useGetVendors,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const Purchases = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  console.log("🚀 ~ Purchases ~ userData:", userData?.userId)
  const [token] = useAtom(tokenAtom)

  const { data: purchases } = useGetPurchases()
  const { data: items } = useGetItems()
  const { data: vendors } = useGetVendors()
  const { data: bankAccounts } = useGetBankAccounts() // Dynamic bank accounts
  console.log('🚀 ~ Purchases ~ bankAccounts:', bankAccounts)

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetPurchaseType>('purchaseDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const [formData, setFormData] = useState<CreatePurchaseType>({
    itemId: 0,
    totalQuantity: 1,
    notes: '',
    vendorId: 0,
    paymentType: 'cash',
    bankAccountId: null,
    purchaseDate: new Date(),
    totalAmount: 0,
    isSorted: false,
    createdBy: userData?.userId || 0,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }))
    } else if (type === 'date') {
      setFormData((prev) => ({ ...prev, [name]: new Date(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'paymentType') {
      setFormData((prev) => ({
        ...prev,
        [name]: value as 'cash' | 'credit' | 'bank',
        bankAccountId: value === 'bank' ? prev.bankAccountId : null,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
    }
  }

  const resetForm = () => {
    setFormData({
      itemId: 0,
      totalQuantity: 1,
      notes: '',
      vendorId: 0,
      paymentType: 'cash',
      bankAccountId: null,
      purchaseDate: new Date(),
      totalAmount: 0,
      isSorted: false,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setError(null)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddPurchase({ onClose: closePopup, reset: resetForm })

  const handleSort = (column: keyof GetPurchaseType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredPurchases = useMemo(() => {
    if (!purchases?.data) return []
    return purchases.data.filter((purchase: GetPurchaseType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        purchase.itemName?.toLowerCase().includes(searchLower) ||
        purchase.vendorName?.toLowerCase().includes(searchLower) ||
        purchase.totalAmount?.toString().includes(searchLower) ||
        purchase.paymentType?.toLowerCase().includes(searchLower)
      )
    })
  }, [purchases?.data, searchTerm])

  const sortedPurchases = useMemo(() => {
    return [...filteredPurchases].sort((a, b) => {
      const aValue = a[sortColumn] ?? ''
      const bValue = b[sortColumn] ?? ''

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
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
  }, [filteredPurchases, sortColumn, sortDirection])

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedPurchases.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedPurchases, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedPurchases.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.itemId || formData.itemId === 0) {
      setError('Please select an item')
      return
    }
    if (!formData.vendorId || formData.vendorId === 0) {
      setError('Please select a vendor')
      return
    }
    if (
      formData.paymentType === 'bank' &&
      (!formData.bankAccountId || formData.bankAccountId === 0)
    ) {
      setError('Please select a bank account for bank payment')
      return
    }

    try {
      mutation.mutate(formData)
    } catch (err) {
      setError('Failed to create purchase')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding purchase')
  }, [mutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <ShoppingCart className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Purchases</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search purchases..."
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
                onClick={() => handleSort('vendorName')}
                className="cursor-pointer"
              >
                Vendor <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('totalQuantity')}
                className="cursor-pointer"
              >
                Quantity <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('totalAmount')}
                className="cursor-pointer"
              >
                Total Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('paymentType')}
                className="cursor-pointer"
              >
                Payment Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('purchaseDate')}
                className="cursor-pointer"
              >
                Purchase Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('bankName')}
                className="cursor-pointer"
              >
                Bank Details <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
            {!purchases?.data ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading purchases...
                </TableCell>
              </TableRow>
            ) : purchases.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No purchases found
                </TableCell>
              </TableRow>
            ) : paginatedPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No purchases match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedPurchases.map((purchase) => (
                <TableRow key={purchase.purchaseId}>
                  <TableCell>{purchase.itemName}</TableCell>
                  <TableCell>{purchase.vendorName}</TableCell>
                  <TableCell>{purchase.totalQuantity}</TableCell>
                  <TableCell>{purchase.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">
                    {purchase.paymentType}
                  </TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell>
                    {purchase.bankName
                      ? `${purchase.bankName} - ${purchase.branch} - ${purchase.accountNumber}`
                      : '-'}
                  </TableCell>
                  <TableCell>{purchase.notes || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedPurchases.length > 0 && (
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

      {/* Add Purchase Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Add Purchase"
        size="sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Item */}
            <div className="space-y-2">
              <Label htmlFor="itemId">Item*</Label>
              <CustomCombobox
                items={
                  items?.data?.map((item) => ({
                    id: item?.itemId?.toString() || '0',
                    name: item.itemName || 'Unnamed item',
                  })) || []
                }
                value={
                  formData.itemId > 0
                    ? {
                        id: formData.itemId.toString(),
                        name:
                          items?.data?.find((i) => i.itemId === formData.itemId)
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

            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor*</Label>
              <CustomCombobox
                items={
                  vendors?.data?.map((vendor) => ({
                    id: vendor?.vendorId?.toString() || '0',
                    name: vendor.name || 'Unnamed vendor',
                  })) || []
                }
                value={
                  formData.vendorId > 0
                    ? {
                        id: formData.vendorId.toString(),
                        name:
                          vendors?.data?.find(
                            (v) => v.vendorId === formData.vendorId
                          )?.name || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange('vendorId', value ? String(value.id) : '0')
                }
                placeholder="Select vendor"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="totalQuantity">Quantity*</Label>
              <Input
                id="totalQuantity"
                name="totalQuantity"
                type="number"
                min="1"
                value={formData.totalQuantity}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount*</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.totalAmount}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type*</Label>
              <Select
                name="paymentType"
                value={formData.paymentType}
                onValueChange={(value) =>
                  handleSelectChange('paymentType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="mfs">MFS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date*</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate.toISOString().split('T')[0]}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Bank Account (only if bank payment) */}
            {formData.paymentType === 'bank' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bankAccountId">Bank Account*</Label>
                <CustomCombobox
                  items={
                    bankAccounts?.data?.map((bank) => ({
                      id: bank.bankAccountId?.toString() || '0',
                      name: `${bank.bankName} - ${bank.accountNumber} - ${bank.branch}`,
                    })) || []
                  }
                  value={
                    formData.bankAccountId
                      ? {
                          id: formData.bankAccountId.toString(),
                          name:
                            bankAccounts?.data?.find(
                              (b) => b.bankAccountId === formData.bankAccountId
                            )?.bankName || '',
                        }
                      : null
                  }
                  onChange={(value) =>
                    handleSelectChange('bankAccountId', value ? String(value.id) : '0')
                  }
                  placeholder="Select bank account"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes ?? ''}
                onChange={handleInputChange}
                placeholder="Add any additional notes..."
                rows={3}
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

export default Purchases
