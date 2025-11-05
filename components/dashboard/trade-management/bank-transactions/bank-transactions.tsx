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
import { ArrowUpDown, Search, Wallet, Edit2 } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type { CreateTransactionType, GetTransactionType } from '@/utils/type'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import formatDate from '@/utils/formatDate'
import {
  useGetTransactions,
  useAddTransaction,
  useEditTransaction,
  useGetBankAccounts,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const BankTransactions = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  const { data: allTransactions } = useGetTransactions()

  const bankTransactions = allTransactions?.data?.filter(
    (t) => t.transactionType === 'contra'
  )

  const { data: bankAccounts } = useGetBankAccounts()

  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetTransactionType>('transactionDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // simplified local state for form
  const [formData, setFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdraw',
    date: new Date().toISOString().split('T')[0],
    bankAccountId: 0,
    amount: 0,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'type') {
      setFormData((prev) => ({
        ...prev,
        type: value as 'deposit' | 'withdraw',
      }))
    } else if (name === 'bankAccountId') {
      setFormData((prev) => ({ ...prev, bankAccountId: Number(value) }))
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'deposit',
      date: new Date().toISOString().split('T')[0],
      bankAccountId: 0,
      amount: 0,
    })
    setEditingId(null)
    setIsPopupOpen(false)
    setError(null)
  }

  const closePopup = useCallback(() => {
    resetForm()
  }, [])

  const addMutation = useAddTransaction({
    onClose: closePopup,
    reset: resetForm,
  })
  const editMutation = useEditTransaction({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSort = (column: keyof GetTransactionType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!bankTransactions) return []
    return bankTransactions.filter((transaction: GetTransactionType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.bankName?.toLowerCase().includes(searchLower) ||
        transaction.branch?.toLowerCase().includes(searchLower) ||
        transaction.accountNumber?.toLowerCase().includes(searchLower) ||
        transaction.amount?.toString().includes(searchLower)
      )
    })
  }, [bankTransactions, searchTerm])

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
      return 0
    })
  }, [filteredTransactions, sortColumn, sortDirection])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedTransactions, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)

  const handleEdit = (transaction: GetTransactionType) => {
    setFormData({
      type: 'deposit',
      date:
        transaction.transactionDate ?? new Date().toISOString().split('T')[0],
      bankAccountId: transaction.bankId ?? 0,
      amount: transaction.amount ?? 0,
    })
    setEditingId(transaction.transactionId ?? null)
    setIsPopupOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.type) return setError('Please select transaction type')
    if (!formData.amount || formData.amount <= 0)
      return setError('Please enter valid amount')
    if (!formData.date) return setError('Please select date')
    if (!formData.bankAccountId) return setError('Please select bank account')

    try {
      const baseData: Partial<CreateTransactionType> = {
        transactionType: 'contra',
        transactionDate: formData.date,
        bankId: formData.bankAccountId,
        createdBy: userData?.userId,
        createdAt: new Date().toISOString(),
      }

      // create 2 entries for each operation
      if (formData.type === 'deposit') {
        // deposit => bank +, cash -
        const bankTx: CreateTransactionType = {
          ...baseData,
          isCash: false,
          amount: formData.amount,
        } as CreateTransactionType

        const cashTx: CreateTransactionType = {
          ...baseData,
          isCash: true,
          amount: -formData.amount,
          bankId: null,
        } as CreateTransactionType

        await addMutation.mutateAsync(bankTx)
        await addMutation.mutateAsync(cashTx)
      } else {
        // withdraw => bank -, cash +
        const bankTx: CreateTransactionType = {
          ...baseData,
          isCash: false,
          amount: -formData.amount,
        } as CreateTransactionType

        const cashTx: CreateTransactionType = {
          ...baseData,
          isCash: true,
          amount: formData.amount,
          bankId: null,
        } as CreateTransactionType

        await addMutation.mutateAsync(bankTx)
        await addMutation.mutateAsync(cashTx)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to save transaction')
    }
  }

  useEffect(() => {
    if (addMutation.error) setError('Error adding transaction')
    if (editMutation.error) setError('Error editing transaction')
  }, [addMutation.error, editMutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Wallet className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Bank Transactions</h2>
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
            className="bg-amber-500 hover:bg-amber-600 text-black"
            onClick={() => {
              resetForm()
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
              <TableHead
                onClick={() => handleSort('amount')}
                className="cursor-pointer"
              >
                Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!bankTransactions ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : bankTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow key={t.transactionId}>
                  <TableCell>
                    {formatDate(
                      t.transactionDate ? new Date(t.transactionDate) : null
                    )}
                  </TableCell>
                  <TableCell>
                    {t.bankName
                      ? `${t.bankName} - ${t.bankAccount} - ${t.bankAccountName}`
                      : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {t.amount?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(t)}
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
      {sortedTransactions.length > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= currentPage - 2 && i <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                  return (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
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

      {/* Popup Form */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={editingId ? 'Edit Transaction' : 'Add Transaction'}
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type*</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleSelectChange('type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdraw">Withdraw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount*</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date*</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label htmlFor="bankAccountId">Bank Account*</Label>
              <CustomCombobox
                items={
                  bankAccounts?.data?.map((b) => ({
                    id: b.bankAccountId?.toString() || '0',
                    name: `${b.bankName} - ${b.accountNumber} - ${b.branch}`,
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
                onChange={(v) =>
                  handleSelectChange('bankAccountId', v ? v.id : '0')
                }
                placeholder="Select bank account"
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
            <Button
              type="submit"
              disabled={addMutation.isPending || editMutation.isPending}
            >
              {addMutation.isPending || editMutation.isPending
                ? 'Saving...'
                : 'Save'}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default BankTransactions
