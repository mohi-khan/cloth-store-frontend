'use client'

import type React from 'react'
import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
import { ArrowUpDown, Search } from 'lucide-react'
import { Popup } from '@/utils/popup'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import {
  useGetClaimTypeBalance,
  useEditClaimTypeBalance,
} from '@/hooks/use-api'
import type {
  GetClaimTypeBalanceType,
  EditClaimTypeBalanceType,
} from '@/utils/type'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ClaimTypeBalance = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  const { data: balances } = useGetClaimTypeBalance()
  console.log("🚀 ~ ClaimTypeBalance ~ balances:", balances)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetClaimTypeBalanceType>('empId')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingBalance, setEditingBalance] =
    useState<GetClaimTypeBalanceType | null>(null)
  const [formData, setFormData] = useState<EditClaimTypeBalanceType | null>(
    null
  )

  const resetForm = () => {
    setIsEditMode(false)
    setEditingBalance(null)
    setFormData(null)
    setIsPopupOpen(false)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  const editMutation = useEditClaimTypeBalance({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleEdit = (balance: GetClaimTypeBalanceType) => {
    setIsEditMode(true)
    setEditingBalance(balance)
    setFormData({
      ...balance,
      updatedBy: userData?.userId as number,
    })
    setIsPopupOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              name === 'amount'
                ? Number(value)
                : name === 'claimDate'
                  ? new Date(value)
                  : value,
          }
        : prev
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBalance || !formData) return

    editMutation.mutate({
      id: editingBalance.claimTypeId!,
      data: formData,
    })
  }

  const handleSort = (column: keyof GetClaimTypeBalanceType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredBalances = useMemo(() => {
    if (!balances?.data) return []
    return balances.data.filter((balance: GetClaimTypeBalanceType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        balance.empId?.toString().includes(searchLower) ||
        balance.claimType?.toLowerCase().includes(searchLower) ||
        balance.amount?.toString().includes(searchLower) ||
        balance.notes?.toLowerCase().includes(searchLower)
      )
    })
  }, [balances?.data, searchTerm])

  const sortedBalances = useMemo(() => {
    return [...filteredBalances].sort((a, b) => {
      const aValue = a[sortColumn] ?? ''
      const bValue = b[sortColumn] ?? ''

      if (sortColumn === 'claimDate') {
        const aDate = new Date(aValue as string)
        const bDate = new Date(bValue as string)
        return sortDirection === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime()
      }

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Claim Type Balance</h2>
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
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('empId')}
                className="cursor-pointer"
              >
                Employee <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('claimType')}
                className="cursor-pointer"
              >
                Claim Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('amount')}
                className="cursor-pointer"
              >
                Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('notes')}
                className="cursor-pointer"
              >
                Notes <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('claimDate')}
                className="cursor-pointer"
              >
                Claim Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!balances || balances.data === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading claim type balances...
                </TableCell>
              </TableRow>
            ) : !balances.data || balances.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No balances found
                </TableCell>
              </TableRow>
            ) : paginatedBalances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No balances match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedBalances.map((balance) => (
                <TableRow key={balance.claimTypeId}>
                  <TableCell>{balance.employeeName}</TableCell>
                  <TableCell>{balance.claimType}</TableCell>
                  <TableCell>{balance.amount}</TableCell>
                  <TableCell>{balance.notes ?? '-'}</TableCell>
                  <TableCell>
                    {new Date(balance.claimDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(balance)}
                    >
                      Edit
                    </Button>
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
        title={isEditMode ? 'Edit Claim Type Balance' : ''}
        size="sm:max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="empId">Employee ID</Label>
            <Input
              id="empId"
              name="empId"
              type="number"
              value={formData?.empId ?? ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimType">Claim Type</Label>
            <Select
              name="claimType"
              onValueChange={(value) =>
                setFormData((prev) =>
                  prev
                    ? {
                        ...prev,
                        claimType: value as 'Medicine' | 'Hospital' | 'Travel' | 'Mobile Handset',
                      }
                    : prev
                )
              }
              value={formData?.claimType ?? ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Claim Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medicine">Medicine</SelectItem>
                <SelectItem value="Hospital">Hospital</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Mobile Handset">Mobile Handset</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData?.amount ?? ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={formData?.notes ?? ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimDate">Claim Date</Label>
            <Input
              id="claimDate"
              name="claimDate"
              type="date"
              value={
                formData?.claimDate
                  ? new Date(formData.claimDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default ClaimTypeBalance
