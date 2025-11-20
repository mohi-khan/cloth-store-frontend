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
import { Textarea } from '@/components/ui/textarea'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpDown, Search, ShoppingCart, Edit2, Plus } from 'lucide-react'
import { Popup } from '@/utils/popup'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  useAddSale,
  useGetBankAccounts,
  useGetItems,
  useGetSales,
  useGetCustomers,
  useEditSale,
  useDeleteSale,
  useGetAvailableItem,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import type {
  CreateSalesType,
  GetItemType,
  GetSaleDetailsType,
  GetSalesType,
} from '@/utils/type'
import { SaleDetailRow } from './sale-details-row'
import { toast } from '@/hooks/use-toast'
import { getAvailableItem } from '@/utils/api'
import { formatDate, formatNumber } from '@/utils/conversions'

const Sales = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: sales } = useGetSales()
  const { data: rawItems } = useGetItems()
  const items =
    rawItems?.data?.filter((item: GetItemType) => item.isBulk === false) || []
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

  const [formData, setFormData] = useState<
    CreateSalesType & {
      salesMaster: CreateSalesType['salesMaster'] & { saleMasterId?: number }
    }
  >({
    salesMaster: {
      customerId: 0,
      paymentType: 'credit',
      bankAccountId: null,
      saleDate: new Date(),
      totalAmount: 0,
      totalQuantity: 0,
      notes: '',
      discountAmount: 0,
      createdBy: userData?.userId || 0,
      saleMasterId: undefined,
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

  const [saleDetails, setSaleDetails] = useState<
    (GetSaleDetailsType & { saleDetailsId?: number; rowId: string })[]
  >([
    {
      itemId: 0,
      itemName: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0,
      createdBy: userData?.userId || 0,
      saleDetailsId: undefined,
      rowId: `row-${Date.now()}-0`,
    },
  ])

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
          paymentType: value as 'credit',
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
    index: number,
    field: keyof GetSaleDetailsType,
    value: string | number
  ) => {
    const numValue = typeof value === 'string' ? Number(value) : value

    setSaleDetails((prev) =>
      prev.map((detail, i) => {
        if (i === index) {
          const updatedDetail = { ...detail, [field]: numValue }
          // Auto-calculate amount
          if (field === 'quantity' || field === 'unitPrice') {
            updatedDetail.amount =
              updatedDetail.quantity * updatedDetail.unitPrice
          }
          return updatedDetail
        }
        return detail
      })
    )
  }

  // Handler for item selection in sale details
  const handleItemSelect = (index: number, itemId: number) => {
    setSaleDetails((prev) =>
      prev.map((detail, i) =>
        i === index
          ? {
              ...detail,
              itemId,
              itemName:
                items?.find((itm) => itm.itemId === itemId)?.itemName || '',
            }
          : detail
      )
    )
  }

  const handleAddRow = () => {
    setSaleDetails((prev) => {
      console.log('🚀 ~ handleAddRow ~ prev:', prev.length + 1)
      return [
        ...prev,
        {
          itemId: 0,
          itemName: '',
          quantity: 0,
          unitPrice: 0,
          amount: 0,
          createdBy: userData?.userId || 0,
          saleDetailsId: undefined,
          rowId: `${prev.length + 1}`,
        },
      ]
    })
  }

  const handleRemoveRow = (index: number) => {
    if (saleDetails.length > 1) {
      setSaleDetails(saleDetails.filter((_, i) => i !== index))
    }
  }

  const handleRemoveEditSaleDetail = async (index: number) => {
    if (saleDetails.length > 1) {
      const detailToDelete = saleDetails[index]

      // If the detail has a saleDetailsId, it exists in the database and needs to be deleted
      if (detailToDelete.saleDetailsId) {
        try {
          await deleteMutation.mutateAsync({
            saleMasterId: formData.salesMaster.saleMasterId || 0,
            saleDetailsId: detailToDelete.saleDetailsId,
            userId: userData?.userId || 0,
          })
        } catch (err) {
          console.error('Error deleting sale detail:', err)
          return
        }
      }

      // Remove from local state
      setSaleDetails(saleDetails.filter((_, i) => i !== index))
    }
  }

  const resetForm = useCallback(() => {
    setFormData({
      salesMaster: {
        customerId: 0,
        paymentType: 'credit',
        bankAccountId: null,
        saleDate: new Date(),
        totalAmount: 0,
        totalQuantity: 0,
        notes: '',
        discountAmount: 0,
        createdBy: userData?.userId || 0,
        saleMasterId: undefined,
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

    setSaleDetails([
      {
        itemId: 0,
        itemName: '',
        quantity: 0,
        unitPrice: 0,
        amount: 0,
        createdBy: userData?.userId || 0,
        saleDetailsId: undefined,
        rowId: `row-${Date.now()}-0`,
      },
    ])

    setIsPopupOpen(false)
    setError(null)
  }, [userData?.userId])

  const closePopup = useCallback(() => {
    resetForm()
  }, [resetForm])

  const mutation = useAddSale({ onClose: closePopup, reset: resetForm })

  const editMutation = useEditSale({
    onClose: closePopup,
    reset: resetForm,
  })

  const deleteMutation = useDeleteSale({
    onClose: () => {},
    reset: () => {},
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
          (sale.salesMaster as any)?.customerName?.toString().toLowerCase() ??
          ''
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

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

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

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

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

  const fetchAvailableQuantity = async (itemId: number): Promise<number> => {
    try {
      const data = await getAvailableItem(itemId, token)
      return data?.data?.availableQuantity ?? 0
    } catch (err) {
      console.error('Error fetching available quantity:', err)
      return 0
    }
  }
  // const { data: availableItemData, refetch } = useGetAvailableItem(itemId)

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

    const validSaleDetails = saleDetails.filter(
      (detail) =>
        detail.itemId > 0 &&
        detail.quantity > 0 &&
        detail.unitPrice > 0 &&
        detail.amount > 0
    )

    if (validSaleDetails.length === 0) {
      setError(
        'Please add at least one item with quantity and price (amount must be greater than 0)'
      )
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
      for (const detail of validSaleDetails) {
        const availableQty = await fetchAvailableQuantity(detail.itemId)
        console.log('🚀 ~ handleSubmit ~ availableQty:', availableQty)
        const itemName = detail.itemName || 'Unknown item'

        if (detail.quantity > availableQty) {
          toast({
            title: 'Error',
            description: `Insufficient stock for "${itemName}". Available: ${availableQty}, Requested: ${detail.quantity}`,
            variant: 'destructive',
          })
          return // Popup stays open on error
        }
      }
    } catch (err) {
      setError('Error validating stock availability')
      console.error(err)
      return
    }

    try {
      const totalQuantity = validSaleDetails.reduce(
        (sum, d) => sum + d.quantity,
        0
      )
      const totalAmount = validSaleDetails.reduce((sum, d) => sum + d.amount, 0)

      const updatedFormData: any = {
        salesMaster: {
          ...formData.salesMaster,
          totalQuantity,
          totalAmount,
        },
        saleDetails: validSaleDetails.map((detail) => ({
          itemId: detail.itemId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          amount: Math.round(Number(detail.amount)),
          saleMasterId: formData.salesMaster.saleMasterId,
          createdBy: userData?.userId || 0,
          ...(detail.saleDetailsId && { saleDetailsId: detail.saleDetailsId }),
        })),
      }

      if (
        formData.salesMaster.saleMasterId &&
        formData.salesMaster.saleMasterId > 0
      ) {
        editMutation.mutate({
          id: formData.salesMaster.saleMasterId,
          data: updatedFormData,
        })
      } else {
        mutation.mutate(updatedFormData)
      }
    } catch (err) {
      setError('Failed to save sale')
      console.error(err)
    }
  }

  const loadSaleForEditing = (sale: GetSalesType) => {
    setFormData({
      salesMaster: {
        customerId: sale.salesMaster.customerId ?? 0,
        paymentType: sale.salesMaster.paymentType ?? 'credit',
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
        saleMasterId: (sale.salesMaster as any).saleMasterId,
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

    if (sale.saleDetails && sale.saleDetails.length > 0) {
      setSaleDetails(
        sale.saleDetails.map((detail, idx) => {
          const itemData = items?.find((i) => i.itemId === detail.itemId)
          return {
            itemId: detail.itemId,
            itemName: itemData?.itemName || '',
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            amount: detail.amount,
            createdBy: userData?.userId || 0,
            saleDetailsId: (detail as any)?.saleDetailsId,
            rowId: `row-${Date.now()}-${idx}`,
          }
        })
      )
    } else {
      setSaleDetails([
        {
          itemId: 0,
          itemName: '',
          quantity: 0,
          unitPrice: 0,
          amount: 0,
          createdBy: userData?.userId || 0,
          saleDetailsId: undefined,
          rowId: `row-${Date.now()}-0`,
        },
      ])
    }

    setIsPopupOpen(true)
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding sale')
    if (editMutation.error) setError('Error editing sale')
  }, [mutation.error, editMutation.error])

  return (
    <div className="p-6 space-y-6">
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
              resetForm()
              setIsPopupOpen(true)
            }}
          >
            Add
          </Button>
        </div>
      </div>

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
              {/* <TableHead>Actions</TableHead> */}
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
                <TableRow key={sale.salesMaster?.saleMasterId || Math.random()}>
                  <TableCell>
                    {(sale.salesMaster as any)?.customerName ?? '-'}
                  </TableCell>
                  <TableCell>{formatNumber(sale.salesMaster?.totalQuantity) ?? 0}</TableCell>
                  <TableCell>
                    {formatNumber((sale.salesMaster?.totalAmount) ?? 0)}
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
                  {/* <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadSaleForEditing(sale)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={formData.salesMaster.saleMasterId ? 'Edit Sale' : 'Add Sale'}
        size="sm:max-w-5xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="saleDate">Sale Date*</Label>
              <Input
                id="saleDate"
                name="saleDate"
                type="date"
                value={
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

          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Sale Details</h3>

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-1/4">Item</TableHead>
                    <TableHead className="w-1/6">Available Item</TableHead>
                    <TableHead className="w-1/6">Quantity</TableHead>
                    <TableHead className="w-1/6">Unit Price</TableHead>
                    <TableHead className="w-1/6">Amount</TableHead>
                    <TableHead className="w-1/12">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleDetails.map((detail, index) => (
                    <SaleDetailRow
                      key={detail.rowId}
                      detail={detail}
                      index={index}
                      items={items}
                      handleItemSelect={handleItemSelect}
                      handleDetailChange={handleDetailChange}
                      handleRemoveRow={
                        formData.salesMaster.saleMasterId
                          ? () => handleRemoveEditSaleDetail(index)
                          : () => handleRemoveRow(index)
                      }
                      saleDetailsLength={saleDetails.length}
                      isEditing={!!formData.salesMaster.saleMasterId}
                      saleMasterId={formData.salesMaster.saleMasterId}
                      userData={userData}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddRow}
              className="w-full bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More
            </Button>
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
                : formData.salesMaster.saleMasterId
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
