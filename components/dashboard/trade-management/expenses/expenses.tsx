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
import { ArrowUpDown, Search, DollarSign } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type { CreateExpenseType, GetExpenseType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import formatDate from '@/utils/formatDate'
import {
  useAddExpense,
  useGetBankAccounts,
  useGetAccountHeads,
  useGetExpenses,
  useGetVendors,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const Expenses = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  console.log('🚀 ~ Expenses ~ userData:', userData?.userId)
  const [token] = useAtom(tokenAtom)

  const { data: expenses } = useGetExpenses()
  console.log("🚀 ~ Expenses ~ expenses:", expenses)
  const { data: vendors } = useGetVendors()
  console.log("🚀 ~ Expenses ~ vendors:", vendors)
  const { data: accountHeads } = useGetAccountHeads()
  const { data: bankAccounts } = useGetBankAccounts()
  console.log('🚀 ~ Expenses ~ bankAccounts:', bankAccounts)

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetExpenseType>('expenseDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const [formData, setFormData] = useState<CreateExpenseType>({
    accountHeadId: 0,
    amount: 0,
    expenseDate: new Date(),
    remarks: '',
    paymentType: 'cash',
    bankAccountId: null,
    vendorId: null,
    createdBy: userData?.userId || 0,
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      createdBy: userData?.userId || 0,
    }))
  }, [userData?.userId])

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
        [name]: value as 'bank' | 'cash' | 'mfs',
        bankAccountId: value === 'bank' ? prev.bankAccountId : null,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
    }
  }

  const resetForm = () => {
    setFormData({
      accountHeadId: 0,
      amount: 0,
      expenseDate: new Date(),
      remarks: '',
      paymentType: 'cash',
      bankAccountId: null,
      vendorId: null,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setError(null)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddExpense({ onClose: closePopup, reset: resetForm })

  const handleSort = (column: keyof GetExpenseType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredExpenses = useMemo(() => {
    if (!expenses?.data) return []
    return expenses.data.filter((expense: GetExpenseType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        expense.accountHeadName?.toLowerCase().includes(searchLower) ||
        expense.amount?.toString().includes(searchLower) ||
        expense.paymentType?.toLowerCase().includes(searchLower) ||
        expense.vendorName?.toLowerCase().includes(searchLower) ||
        expense.remarks?.toLowerCase().includes(searchLower)
      )
    })
  }, [expenses?.data, searchTerm])

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
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
  }, [filteredExpenses, sortColumn, sortDirection])

  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedExpenses.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedExpenses, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.accountHeadId || formData.accountHeadId === 0) {
      setError('Please select an account head')
      return
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount')
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
      setError('Failed to create expense')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding expense')
  }, [mutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <DollarSign className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Expenses</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search expenses..."
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
                onClick={() => handleSort('accountHeadName')}
                className="cursor-pointer"
              >
                Account Head <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('amount')}
                className="cursor-pointer"
              >
                Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('expenseDate')}
                className="cursor-pointer"
              >
                Expense Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('paymentType')}
                className="cursor-pointer"
              >
                Payment Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('bankName')}
                className="cursor-pointer"
              >
                Vendor <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('bankName')}
                className="cursor-pointer"
              >
                Bank Details <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('remarks')}
                className="cursor-pointer"
              >
                Remarks <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!expenses?.data ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading expenses...
                </TableCell>
              </TableRow>
            ) : expenses.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No expenses found
                </TableCell>
              </TableRow>
            ) : paginatedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No expenses match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedExpenses.map((expense) => (
                <TableRow key={expense.expenseId}>
                  <TableCell>{expense.accountHeadName}</TableCell>
                  <TableCell>{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                  <TableCell className="capitalize">
                    {expense.paymentType}
                  </TableCell>
                  <TableCell>{expense.vendorName}</TableCell>
                  <TableCell>
                    {expense.bankName
                      ? `${expense.bankName} - ${expense.branch} - ${expense.accountNumber}`
                      : '-'}
                  </TableCell>
                  <TableCell>{expense.remarks || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedExpenses.length > 0 && (
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

      {/* Add Expense Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Add Expense"
        size="sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Account Head */}
            <div className="space-y-2">
              <Label htmlFor="accountHeadId">Account Head*</Label>
              <CustomCombobox
                items={
                  accountHeads?.data?.map((head) => ({
                    id: head?.accountHeadId?.toString() || '0',
                    name: head.name || 'Unnamed account head',
                  })) || []
                }
                value={
                  formData.accountHeadId > 0
                    ? {
                        id: formData.accountHeadId.toString(),
                        name:
                          accountHeads?.data?.find(
                            (h) => h.accountHeadId === formData.accountHeadId
                          )?.name || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange(
                    'accountHeadId',
                    value ? String(value.id) : '0'
                  )
                }
                placeholder="Select account head"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor*</Label>
              <CustomCombobox
                items={
                  vendors?.data?.map((vendor) => ({
                    id: vendor?.vendorId?.toString() || '0',
                    name: vendor.name || 'Unnamed account head',
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
                placeholder="Select account head"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount*</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Expense Date */}
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Expense Date*</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                value={formData.expenseDate.toISOString().split('T')[0]}
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
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="mfs">MFS</SelectItem>
                </SelectContent>
              </Select>
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
                    handleSelectChange(
                      'bankAccountId',
                      value ? String(value.id) : '0'
                    )
                  }
                  placeholder="Select bank account"
                />
              </div>
            )}

            {/* Remarks */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks ?? ''}
                onChange={handleInputChange}
                placeholder="Add any additional remarks..."
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

export default Expenses
