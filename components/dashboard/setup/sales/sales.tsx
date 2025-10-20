// Sales.tsx (full updated file)
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
import { ArrowUpDown, Search, ShoppingCart, Edit2 } from 'lucide-react'
import { Popup } from '@/utils/popup'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import formatDate from '@/utils/formatDate'
import {
  useAddSale,
  useGetBankAccounts,
  useGetItems,
  useGetSales,
  useGetCustomers,
  useEditSaleLevel,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { CreateSalesType, GetSaleDetailsType, GetSalesType } from '@/utils/type'

const Sales = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: sales } = useGetSales()
  console.log("🚀 ~ Sales ~ sales:", sales)
  const { data: items } = useGetItems()
  const { data: customers } = useGetCustomers()
  const { data: bankAccounts } = useGetBankAccounts()

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | undefined>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<CreateSalesType>({
    salesMaster: {
      customerId: 0,
      paymentType: 'cash',
      bankAccountId: null,
      saleDate: new Date(),
      totalAmount: 0,
      totalQuantity: 0,
      notes: '',
      discountAmount: 0,
      createdBy: userData?.userId || 0,
    },
    saleDetails: [
      {
        itemId: 0,
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        createdBy: userData?.userId || 0,
      },
    ],
  })

  const [saleDetail, setSaleDetail] = useState<GetSaleDetailsType>({
    itemId: 0,
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    createdBy: userData?.userId || 0,
  })

  const [showItemsTable, setShowItemsTable] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        salesMaster: {
          ...prev.salesMaster,
          [name]: value ? Number(value) : 0,
        },
      }))
    } else if (type === 'date') {
      setFormData((prev) => ({
        ...prev,
        salesMaster: {
          ...prev.salesMaster,
          [name]: new Date(value),
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        salesMaster: {
          ...prev.salesMaster,
          [name]: value,
        },
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'paymentType') {
      setFormData((prev) => ({
        ...prev,
        salesMaster: {
          ...prev.salesMaster,
          paymentType: value as 'cash' | 'credit' | 'bank' | 'mfs',
          bankAccountId:
            value === 'bank' ? prev.salesMaster.bankAccountId : null,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        salesMaster: {
          ...prev.salesMaster,
          [name]: Number(value),
        },
      }))
    }
  }

  const handleDetailChange = (
    field: keyof GetSaleDetailsType,
    value: string | number
  ) => {
    const numValue = typeof value === 'string' ? Number(value) : value

    if (field === 'itemId') {
      const selectedItem = items?.data?.find((i) => i.itemId === numValue)
      setSaleDetail({
        ...saleDetail,
        itemId: numValue,
        itemName: selectedItem?.itemName,
      })
    } else if (field === 'quantity' || field === 'unitPrice') {
      const updatedDetail = { ...saleDetail, [field]: numValue }
      updatedDetail.amount = updatedDetail.quantity * updatedDetail.unitPrice
      setSaleDetail(updatedDetail)
    } else {
      setSaleDetail({ ...saleDetail, [field]: numValue })
    }
  }

  const handleSelectItem = (itemId: number) => {
    const selectedItem = items?.data?.find((i) => i.itemId === itemId)
    setSaleDetail({
      ...saleDetail,
      itemId: itemId,
      itemName: selectedItem?.itemName,
    })
    setShowItemsTable(false)
  }

  const resetForm = useCallback(() => {
    setFormData({
      salesMaster: {
        customerId: 0,
        paymentType: 'cash',
        bankAccountId: null,
        saleDate: new Date(),
        totalAmount: 0,
        totalQuantity: 0,
        notes: '',
        discountAmount: 0,
        createdBy: userData?.userId || 0,
      },
      saleDetails: [
        {
          itemId: 0,
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          createdBy: userData?.userId || 0,
        },
      ],
    })

    setSaleDetail({
      itemId: 0,
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      createdBy: userData?.userId || 0,
    })

    setShowItemsTable(false)
    setIsPopupOpen(false)
    setIsEditMode(false)
    setEditingId(null)
    setError(null)
  }, [userData?.userId])

  const closePopup = useCallback(() => {
    resetForm()
  }, [resetForm])

  const mutation = useAddSale({ onClose: closePopup, reset: resetForm })
  const editMutation = useEditSaleLevel({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredSales = useMemo(() => {
    const list = sales?.data ?? []
    if (!Array.isArray(list)) return []

    const lower = searchTerm.toLowerCase()
    return list.filter((sale: GetSalesType) => {
      return (
        (
          (sale.salesMaster as any)?.customerName?.toString().toLowerCase() ?? ''
        ).includes(lower) ||
        sale.salesMaster.totalAmount?.toString().includes(lower) ||
        (sale.salesMaster.paymentType?.toString().toLowerCase() ?? '').includes(
          lower
        )
      )
    })
  }, [sales?.data, searchTerm])

  const sortedSales = useMemo(() => {
    const getValueByPath = (obj: any, path?: string) => {
      if (!path) return undefined
      // support nested path like "salesMaster.saleDate" and also allow top-level or nested within salesMaster when path has no dot
      if (!path.includes('.')) {
        return obj?.[path] ?? obj?.salesMaster?.[path] ?? undefined
      }
      return path
        .split('.')
        .reduce((o: any, key) => (o ? o[key] : undefined), obj)
    }

    return [...filteredSales].sort((a, b) => {
      if (!sortColumn) return 0

      const aValue = getValueByPath(a, sortColumn) ?? ''
      const bValue = getValueByPath(b, sortColumn) ?? ''

      // numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // dates (strings or Date objects)
      const aDate =
        aValue instanceof Date
          ? aValue
          : typeof aValue === 'string' && !isNaN(Date.parse(aValue))
            ? new Date(aValue)
            : null
      const bDate =
        bValue instanceof Date
          ? bValue
          : typeof bValue === 'string' && !isNaN(Date.parse(bValue))
            ? new Date(bValue)
            : null
      if (aDate && bDate) {
        return sortDirection === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime()
      }

      // strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // fallback compare
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredSales, sortColumn, sortDirection])

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedSales.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedSales, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(sortedSales.length / itemsPerPage))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (
      !formData.salesMaster.customerId ||
      formData.salesMaster.customerId === 0
    ) {
      setError('Please select a customer')
      return
    }

    if (
      saleDetail.itemId === 0 ||
      saleDetail.quantity === 0 ||
      saleDetail.unitPrice === 0
    ) {
      setError('Please fill all required fields in sale details')
      return
    }

    if (
      formData.salesMaster.paymentType === 'bank' &&
      (!formData.salesMaster.bankAccountId ||
        formData.salesMaster.bankAccountId === 0)
    ) {
      setError('Please select a bank account for bank payment')
      return
    }

    try {
      const updatedFormData: CreateSalesType = {
        ...formData,
        salesMaster: {
          ...formData.salesMaster,
          totalQuantity: saleDetail.quantity,
          totalAmount: saleDetail.amount,
        },
        saleDetails: [
          {
            itemId: saleDetail.itemId,
            quantity: saleDetail.quantity,
            unitPrice: saleDetail.unitPrice,
            amount: saleDetail.amount,
            createdBy: userData?.userId || 0,
          },
        ],
      }

      if (isEditMode && editingId) {
        // editMutation expects some structure; adjust if your hook wants different payload
        editMutation.mutate({
          id: editingId,
          data: updatedFormData as any,
        })
      } else {
        mutation.mutate(updatedFormData)
      }
    } catch (err) {
      setError('Failed to save sale')
      console.error(err)
    }
  }

  const handleEdit = (sale: GetSalesType) => {
    setIsEditMode(true)
    setEditingId(sale.salesMaster.salesMasterId ?? null)

    // populate formData from flattened sale
    setFormData({
      salesMaster: {
        customerId: sale.salesMaster.customerId ?? 0,
        paymentType: sale.salesMaster.paymentType ?? 'cash',
        bankAccountId: sale.salesMaster.bankAccountId ?? null,
        saleDate: sale.salesMaster.saleDate
          ? sale.salesMaster.saleDate instanceof Date
            ? sale.salesMaster.saleDate
            : new Date(sale.salesMaster.saleDate)
          : new Date(),
        totalAmount: sale.salesMaster.totalAmount ?? 0,
        totalQuantity: sale.salesMaster.totalQuantity ?? 0,
        notes: sale.salesMaster.notes ?? '',
        discountAmount: sale.salesMaster.discountAmount ?? 0,
        createdBy: userData?.userId || 0,
      },
      saleDetails:
        sale.saleDetails && sale.saleDetails.length > 0
          ? sale.saleDetails.map((d) => ({
              itemId: d.itemId,
              quantity: d.quantity,
              unitPrice: d.unitPrice,
              amount: d.amount,
              createdBy: d.createdBy ?? (userData?.userId || 0),
            }))
          : [
              {
                itemId: sale.saleDetails?.[0]?.itemId ?? 0,
                quantity: sale.saleDetails?.[0]?.quantity ?? 1,
                unitPrice: sale.saleDetails?.[0]?.unitPrice ?? 0,
                amount: sale.saleDetails?.[0]?.amount ?? 0,
                createdBy: userData?.userId || 0,
              },
            ],
    })

    // set local saleDetail for edit UI
    if (sale.saleDetails && sale.saleDetails.length > 0) {
      const detail = sale.saleDetails[0]
      setSaleDetail({
        itemId: detail.itemId,
        itemName: (detail as any).itemName,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        amount: detail.amount,
        createdBy: detail.createdBy ?? (userData?.userId || 0),
      })
    } else {
      setSaleDetail({
        itemId: 0,
        itemName: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        createdBy: userData?.userId || 0,
      })
    }
    setIsPopupOpen(true)
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding sale')
    if (editMutation.error) setError('Error editing sale')
  }, [mutation.error, editMutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <ShoppingCart className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Sales</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            className="bg-amber-400 hover:bg-amber-500 text-black"
            onClick={() => {
              setIsEditMode(false)
              setIsPopupOpen(true)
            }}
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
                onClick={() => handleSort('customerName')}
                className="cursor-pointer"
              >
                Customer <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
                onClick={() => handleSort('salesMaster.saleDate')}
                className="cursor-pointer"
              >
                Sale Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!sales?.data ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading sales...
                </TableCell>
              </TableRow>
            ) : (sales.data as GetSalesType[]).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No sales found
                </TableCell>
              </TableRow>
            ) : paginatedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No sales match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedSales.map((sale) => (
                <TableRow
                  key={
                    sale.salesMaster?.salesMasterId ??
                    `${sale.salesMaster?.customerId}-${String(sale.salesMaster?.saleDate)}`
                  }
                >
                  <TableCell>
                    {(sale.salesMaster as any)?.customerName ?? '-'}
                  </TableCell>
                  <TableCell>{sale.salesMaster?.totalQuantity ?? 0}</TableCell>
                  <TableCell>
                    {(sale.salesMaster?.totalAmount ?? 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {sale.salesMaster?.paymentType ?? '-'}
                  </TableCell>
                  <TableCell>
                    {sale.salesMaster?.saleDate
                      ? formatDate(
                          sale.salesMaster?.saleDate instanceof Date
                            ? sale.salesMaster?.saleDate
                            : new Date(sale.salesMaster?.saleDate)
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {(sale.salesMaster as any)?.bankName
                      ? `${(sale.salesMaster as any).bankName} - ${(sale.salesMaster as any).branch ?? ''} - ${(sale.salesMaster as any).accountNumber ?? ''}`
                      : '-'}
                  </TableCell>
                  <TableCell>{sale.salesMaster?.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(sale)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedSales.length > 0 && (
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

      {/* Add/Edit Sale Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={isEditMode ? 'Edit Sale' : 'Add Sale'}
        size="sm:max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Master Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer*</Label>
              <CustomCombobox
                items={
                  customers?.data?.map((customer) => ({
                    id: customer?.customerId?.toString() || '0',
                    name: customer.name || 'Unnamed customer',
                  })) || []
                }
                value={
                  formData.salesMaster.customerId > 0
                    ? {
                        id: formData.salesMaster.customerId.toString(),
                        name:
                          customers?.data?.find(
                            (c) =>
                              c.customerId === formData.salesMaster.customerId
                          )?.name || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange(
                    'customerId',
                    value ? String(value.id) : '0'
                  )
                }
                placeholder="Select customer"
              />
            </div>

            {/* Sale Date */}
            <div className="space-y-2">
              <Label htmlFor="saleDate">Sale Date*</Label>
              <Input
                id="saleDate"
                name="saleDate"
                type="date"
                value={
                  // format to yyyy-mm-dd
                  formData.salesMaster.saleDate instanceof Date
                    ? formData.salesMaster.saleDate.toISOString().split('T')[0]
                    : new Date(formData.salesMaster.saleDate)
                        .toISOString()
                        .split('T')[0]
                }
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type*</Label>
              <Select
                name="paymentType"
                value={formData.salesMaster.paymentType}
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

            {/* Discount Amount */}
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount</Label>
              <Input
                id="discountAmount"
                name="discountAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.salesMaster.discountAmount ?? 0}
                onChange={handleInputChange}
              />
            </div>

            {/* Bank Account (only if bank payment) */}
            {formData.salesMaster.paymentType === 'bank' && (
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
                    formData.salesMaster.bankAccountId
                      ? {
                          id: formData.salesMaster.bankAccountId.toString(),
                          name:
                            bankAccounts?.data?.find(
                              (b) =>
                                b.bankAccountId ===
                                formData.salesMaster.bankAccountId
                            )?.bankName || '',
                        }
                      : null
                  }
                  onChange={(value) =>
                    handleSelectChange(
                      'bankAccountId',
                      value ? String(value.id) : '0'
                    )
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
                value={formData.salesMaster.notes ?? ''}
                onChange={handleInputChange}
                placeholder="Add any additional notes..."
                rows={2}
              />
            </div>
          </div>

          {/* Sale Details Section */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Sale Details</h3>

            {/* Items Table for Selection */}
            {showItemsTable && (
              <div className="rounded-md border overflow-x-auto mb-4">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items?.data?.map((item) => (
                      <TableRow key={item.itemId}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectItem(item.itemId || 0)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Sale Detail Row */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Item*</TableHead>
                    <TableHead>Quantity*</TableHead>
                    <TableHead>Unit Price*</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowItemsTable(!showItemsTable)}
                          className="w-full"
                        >
                          {saleDetail.itemId > 0
                            ? saleDetail.itemName
                            : 'Select Item'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={saleDetail.quantity}
                        onChange={(e) =>
                          handleDetailChange('quantity', e.target.value)
                        }
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={saleDetail.unitPrice}
                        onChange={(e) =>
                          handleDetailChange('unitPrice', e.target.value)
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={saleDetail.amount.toFixed(2)}
                        readOnly
                        className="w-24 bg-gray-100"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || editMutation.isPending}
            >
              {mutation.isPending || editMutation.isPending
                ? 'Saving...'
                : isEditMode
                  ? 'Update'
                  : 'Save'}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default Sales
