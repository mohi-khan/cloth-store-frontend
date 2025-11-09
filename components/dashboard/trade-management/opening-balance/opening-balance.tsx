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
import { ArrowUpDown, Search, Wallet } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type {
  CreateOpeningBalanceType,
  GetOpeningBalanceType,
} from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import formatDate from '@/utils/formatDate'
import {
  useAddOpeningBalance,
  useGetBankAccounts,
  useGetCustomers,
  useGetOpeningBalances,
} from '@/hooks/use-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CustomCombobox } from '@/utils/custom-combobox'

const OpeningBalance = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: openingBalances } = useGetOpeningBalances()
  const { data: bankAccounts } = useGetBankAccounts()
  const { data: customers } = useGetCustomers()

  const router = useRouter()

  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetOpeningBalanceType>('openingAmount')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  const hasNonPartyBalance = useMemo(() => {
    return openingBalances?.data?.some((b) => b.isParty === false) ?? false
  }, [openingBalances])

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
    }

    checkUserData()
  }, [userData, token, router])

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const [formData, setFormData] = useState<CreateOpeningBalanceType>({
    openingAmount: 0,
    isParty: hasNonPartyBalance ? true : false,
    customerId: null,
    bankAccountId: null,
    type: 'debit',
    createdBy: userData?.userId || 0,
    createdAt: new Date().toISOString(),
    updatedBy: null,
    updatedAt: null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target as {
      name: string
      value: string
      type?: string
    }

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : 0,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      openingAmount: 0,
      isParty: hasNonPartyBalance ? true : false,
      customerId: null,
      bankAccountId: null,
      type: 'debit',
      createdBy: userData?.userId || 0,
      createdAt: new Date().toISOString(),
      updatedBy: null,
      updatedAt: null,
    })
    setIsPopupOpen(false)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  useEffect(() => {
    if (isPopupOpen) {
      setFormData((prev) => ({
        ...prev,
        isParty: hasNonPartyBalance ? true : false,
      }))
    }
  }, [hasNonPartyBalance, isPopupOpen])

  const mutation = useAddOpeningBalance({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSort = (column: keyof GetOpeningBalanceType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredBalances = useMemo(() => {
    if (!openingBalances?.data) return []
    return openingBalances.data.filter((balance: any) => {
      const searchLower = searchTerm.toLowerCase()
      return balance.openingAmount?.toString().includes(searchLower)
    })
  }, [openingBalances?.data, searchTerm])

  const sortedBalances = useMemo(() => {
    return [...filteredBalances].sort((a, b) => {
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
  }, [filteredBalances, sortColumn, sortDirection])

  const paginatedBalances = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedBalances.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedBalances, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedBalances.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (hasNonPartyBalance && formData.isParty === false) {
      setError(
        "You can't select 'No' since a non-party balance already exists."
      )
      return
    }

    try {
      mutation.mutate(formData)
    } catch (err) {
      setError('Failed to create opening balance')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) {
      setError('Error adding opening balance')
    }
  }, [mutation.error])

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'isParty') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === 'true',
        customerId: value === 'true' ? prev.customerId : null,
      }))
    } else if (name === 'type') {
      setFormData((prev) => ({
        ...prev,
        [name]: value as 'debit' | 'credit',
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Wallet className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Opening Balance</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search balances..."
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

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('openingAmount')}
                className="cursor-pointer"
              >
                Opening Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('createdAt')}
                className="cursor-pointer"
              >
                Created At <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!openingBalances || openingBalances.data === undefined ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading opening balances...
                </TableCell>
              </TableRow>
            ) : !openingBalances.data || openingBalances.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No opening balances found
                </TableCell>
              </TableRow>
            ) : paginatedBalances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No opening balances match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedBalances.map((balance) => (
                <TableRow key={balance.openingBalanceId}>
                  <TableCell>{balance.openingAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {formatDate(new Date(balance.createdAt))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedBalances.length > 0 && (
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
        title="Add Opening Balance"
        size="sm:max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingAmount">Opening Amount*</Label>
              <Input
                id="openingAmount"
                name="openingAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.openingAmount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type*</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isParty">Is Party*</Label>
              <Select
                name="isParty"
                value={formData.isParty ? 'true' : 'false'}
                onValueChange={(value) => handleSelectChange('isParty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem disabled={hasNonPartyBalance} value="false">
                    No
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">Bank Account*</Label>
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

          {formData.isParty && (
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
                  formData?.customerId && formData.customerId > 0
                    ? {
                        id: formData?.customerId.toString(),
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

export default OpeningBalance
