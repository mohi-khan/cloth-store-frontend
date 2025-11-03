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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpDown, Search, CreditCard } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type { CreateTransactionType, GetTransactionType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import formatDate from '@/utils/formatDate'
import {
  useAddTransaction,
  useGetBankAccounts,
  useGetCustomers,
  useGetTransactions,
  useGetVendors,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const Transactions = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: transactions } = useGetTransactions()
  const { data: vendors } = useGetVendors()
  const { data: customers } = useGetCustomers()
  const { data: bankAccounts } = useGetBankAccounts()

  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetTransactionType>('transactionDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const [formData, setFormData] = useState<
    CreateTransactionType & { paymentType: 'cash' | 'bank' }
  >({
    transactionType: null,
    isCash: true,
    bankId: null,
    customerId: null,
    vendorId: null,
    transactionDate: new Date().toISOString().split('T')[0],
    amount: null,
    createdBy: userData?.userId || 0,
    createdAt: new Date().toISOString(),
    updatedBy: null,
    updatedAt: null,
    paymentType: 'cash',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : null }))
    } else if (type === 'date') {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string | null) => {
    if (name === 'paymentType') {
      setFormData((prev) => ({
        ...prev,
        paymentType: value as 'cash' | 'bank',
        isCash: value === 'cash',
        bankId: value === 'bank' ? prev.bankId : null, // Clear bankId if switching to cash
      }))
    } else if (name === 'transactionType') {
      setFormData((prev) => ({
        ...prev,
        [name]: value as 'payment' | 'received' | 'contra',
        vendorId: null,
        customerId: null,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : null,
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      transactionType: null,
      isCash: true,
      bankId: null,
      customerId: null,
      vendorId: null,
      transactionDate: null,
      amount: null,
      createdBy: userData?.userId || 0,
      createdAt: new Date().toISOString(),
      updatedBy: null,
      updatedAt: null,
      paymentType: 'cash',
    })
    setIsPopupOpen(false)
    setError(null)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddTransaction({ onClose: closePopup, reset: resetForm })

  const handleSort = (column: keyof GetTransactionType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!transactions?.data) return []
    return transactions.data.filter((transaction: GetTransactionType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.transactionType?.toLowerCase().includes(searchLower) ||
        transaction.vendorName?.toLowerCase().includes(searchLower) ||
        transaction.customerName?.toLowerCase().includes(searchLower) ||
        transaction.amount?.toString().includes(searchLower) ||
        transaction.bankName?.toLowerCase().includes(searchLower)
      )
    })
  }, [transactions?.data, searchTerm])

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const aValue = a[sortColumn] ?? ''
      const bValue = b[sortColumn] ?? ''

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      if (
        typeof aValue === 'string' &&
        typeof bValue === 'string' &&
        !isNaN(Date.parse(aValue)) &&
        !isNaN(Date.parse(bValue))
      ) {
        return sortDirection === 'asc'
          ? Date.parse(aValue) - Date.parse(bValue)
          : Date.parse(bValue) - Date.parse(aValue)
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
  }, [filteredTransactions, sortColumn, sortDirection])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedTransactions, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.transactionType) {
      setError('Please select a transaction type')
      return
    }
    if (!formData.amount || formData.amount === 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!formData.transactionDate) {
      setError('Please select a transaction date')
      return
    }

    if (formData.transactionType === 'payment' && !formData.vendorId) {
      setError('Please select a vendor for payment transactions')
      return
    }
    if (formData.transactionType === 'received' && !formData.customerId) {
      setError('Please select a customer for received transactions')
      return
    }

    if (formData.paymentType === 'bank' && !formData.bankId) {
      setError('Please select a bank account for bank payment')
      return
    }

    try {
      const submitData: CreateTransactionType = {
        transactionType: formData.transactionType as
          | 'payment'
          | 'received'
          | 'contra',
        isCash: formData.isCash,
        bankId: formData.bankId,
        customerId: formData.customerId,
        vendorId: formData.vendorId,
        transactionDate: formData.transactionDate,
        amount: formData.amount,
        createdBy: formData.createdBy,
        createdAt: formData.createdAt,
        updatedBy: formData.updatedBy,
        updatedAt: formData.updatedAt,
      }
      console.log('Form Data:', formData)
      console.log('Submit Data:', submitData)
      mutation.mutate(submitData)
    } catch (err) {
      setError('Failed to create transaction')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding transaction')
  }, [mutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <CreditCard className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Transactions</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            className="bg-amber-400 hover:bg-amber-500 text-black"
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
                onClick={() => handleSort('transactionType')}
                className="cursor-pointer"
              >
                Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('vendorName')}
                className="cursor-pointer"
              >
                Vendor <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('customerName')}
                className="cursor-pointer"
              >
                Customer <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('amount')}
                className="cursor-pointer"
              >
                Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('isCash')}
                className="cursor-pointer"
              >
                Payment Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('transactionDate')}
                className="cursor-pointer"
              >
                Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('bankName')}
                className="cursor-pointer"
              >
                Bank Details <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!transactions?.data ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No transactions match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.transactionId}>
                  <TableCell className="capitalize">
                    {transaction.transactionType}
                  </TableCell>
                  <TableCell>{transaction.vendorName || '-'}</TableCell>
                  <TableCell>{transaction.customerName || '-'}</TableCell>
                  <TableCell>{transaction.amount?.toFixed(2)}</TableCell>
                  <TableCell>
                    {transaction.isCash === true ? 'Cash' : 'Bank'}
                  </TableCell>
                  <TableCell>
                    {formatDate(
                      transaction.transactionDate
                        ? new Date(transaction.transactionDate)
                        : null
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.bankName
                      ? `${transaction.bankName} - ${transaction.bankAccount} - ${transaction.bankAccountName}`
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedTransactions.length > 0 && (
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

      {/* Add Transaction Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Add Transaction"
        size="sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type*</Label>
              <Select
                value={formData.transactionType || ''}
                onValueChange={(value) =>
                  handleSelectChange('transactionType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="contra">Contra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vendor (shown for payment transactions) */}
            {formData.transactionType === 'payment' && (
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
                    formData.vendorId
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
                    handleSelectChange(
                      'vendorId',
                      value ? String(value.id) : '0'
                    )
                  }
                  placeholder="Select vendor"
                />
              </div>
            )}

            {/* Customer (shown for received transactions) */}
            {formData.transactionType === 'received' && (
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
                    formData.customerId
                      ? {
                          id: formData.customerId.toString(),
                          name:
                            customers?.data?.find(
                              (c) => c.customerId === formData.customerId
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
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount*</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount ?? ''}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type*</Label>
              <Select
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
                  <SelectItem value="bank">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Date */}
            <div className="space-y-2">
              <Label htmlFor="transactionDate">Transaction Date*</Label>
              <Input
                id="transactionDate"
                name="transactionDate"
                type="date"
                value={formData.transactionDate ?? ''}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Bank Account (only if bank payment) */}
            {formData.paymentType === 'bank' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bankId">Bank Account*</Label>
                <CustomCombobox
                  items={
                    bankAccounts?.data?.map((bank) => ({
                      id: bank.bankAccountId?.toString() || '0',
                      name: `${bank.bankName} - ${bank.accountNumber} - ${bank.branch}`,
                    })) || []
                  }
                  value={
                    formData.bankId
                      ? {
                          id: formData.bankId.toString(),
                          name:
                            bankAccounts?.data?.find(
                              (b) => b.bankAccountId === formData.bankId
                            )?.bankName || '',
                        }
                      : null
                  }
                  onChange={(value) =>
                    handleSelectChange(
                      'bankId',
                      value ? String(value.id) : null
                    )
                  }
                  placeholder="Select bank account"
                />
              </div>
            )}
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

export default Transactions
