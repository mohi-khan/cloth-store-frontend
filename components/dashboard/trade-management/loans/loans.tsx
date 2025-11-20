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
import { ArrowUpDown, Search, DollarSign } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type { CreateLoanType, GetLoanType, GetVendorType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { formatDate, formatNumber } from '@/utils/conversions'
import { useAddLoan, useGetLoans, useGetVendors } from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'

const Loans = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  console.log('🚀 ~ Loans ~ userData:', userData?.userId)
  const [token] = useAtom(tokenAtom)

  const { data: loans } = useGetLoans()
  const { data: rawVendors } = useGetVendors()
  const vendors =
    rawVendors?.data?.filter(
      (vendor: GetVendorType) => vendor.loanGroup === true
    ) || []

  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GetLoanType>('loanDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const [formData, setFormData] = useState<CreateLoanType>({
    uniqueName: '',
    vendorId: null,
    loanDate: new Date().toISOString().split('T')[0],
    loanAmountReceivable: 0,
    remarks: '',
    createdBy: userData?.userId || 0,
  })

  const generateUniqueName = (vendorName: string) => {
    const cleanVendor = vendorName.replace(/\s+/g, '')
    const iso = new Date().toISOString()
    const datePart = iso.split('T')[0].replace(/-/g, '')
    const timePart = iso.split('T')[1].replace(/[:.Z]/g, '')
    return `${cleanVendor}-${datePart}_${timePart}`
  }

  const selectedVendor = vendors.find((v) => v.vendorId === formData.vendorId)
  const computedUniqueName = selectedVendor
    ? generateUniqueName(selectedVendor.name)
    : ''

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
    setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : null }))
  }

  const resetForm = () => {
    setFormData({
      uniqueName: computedUniqueName,
      vendorId: null,
      loanDate: new Date().toISOString().split('T')[0],
      loanAmountReceivable: 0,
      remarks: '',
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setError(null)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddLoan({ onClose: closePopup, reset: resetForm })

  const handleSort = (column: keyof GetLoanType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredLoans = useMemo(() => {
    if (!loans?.data) return []
    return loans.data.filter((loan: GetLoanType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        loan.uniqueName?.toLowerCase().includes(searchLower) ||
        loan.vendorName?.toLowerCase().includes(searchLower) ||
        loan.loanAmountReceivable?.toString().includes(searchLower)
      )
    })
  }, [loans?.data, searchTerm])

  const sortedLoans = useMemo(() => {
    return [...filteredLoans].sort((a, b) => {
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
  }, [filteredLoans, sortColumn, sortDirection])

  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedLoans.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedLoans, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedLoans.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    formData.uniqueName = computedUniqueName
    try {
      mutation.mutate(formData)
    } catch (err) {
      setError('Failed to create loan')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) setError('Error adding loan')
  }, [mutation.error])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <DollarSign className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Loans</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search loans..."
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
                onClick={() => handleSort('uniqueName')}
                className="cursor-pointer"
              >
                Loan Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('vendorName')}
                className="cursor-pointer"
              >
                Vendor <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('loanAmountReceivable')}
                className="cursor-pointer"
              >
                Amount Receivable{' '}
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('loanDate')}
                className="cursor-pointer"
              >
                Loan Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
            {!loans?.data ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading loans...
                </TableCell>
              </TableRow>
            ) : loans.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No loans found
                </TableCell>
              </TableRow>
            ) : paginatedLoans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No loans match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedLoans.map((loan) => (
                <TableRow key={loan.loanId}>
                  <TableCell>{loan.uniqueName}</TableCell>
                  <TableCell>{loan.vendorName || '-'}</TableCell>
                  <TableCell>{formatNumber(loan.loanAmountReceivable.toFixed(2))}</TableCell>
                  <TableCell>{formatDate(new Date(loan.loanDate))}</TableCell>
                  <TableCell>{loan.remarks || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedLoans.length > 0 && (
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

      {/* Add Loan Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Add Loan"
        size="sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Unique Name */}
            <div className="space-y-2">
              <Label htmlFor="uniqueName">Loan Name*</Label>
              <Input
                id="uniqueName"
                name="uniqueName"
                type="text"
                value={computedUniqueName}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendorId">Person</Label>
              <CustomCombobox
                items={
                  vendors?.map((vendor) => ({
                    id: vendor?.vendorId?.toString() || '0',
                    name: vendor.name || 'Unnamed vendor',
                  })) || []
                }
                value={
                  formData.vendorId
                    ? {
                        id: formData.vendorId.toString(),
                        name:
                          vendors?.find((v) => v.vendorId === formData.vendorId)
                            ?.name || '',
                      }
                    : null
                }
                onChange={(value) =>
                  handleSelectChange('vendorId', value ? String(value.id) : '0')
                }
                placeholder="Select person"
              />
            </div>

            {/* Amount Receivable */}
            <div className="space-y-2">
              <Label htmlFor="loanAmountReceivable">Amount Receivable*</Label>
              <Input
                id="loanAmountReceivable"
                name="loanAmountReceivable"
                type="number"
                step="0.01"
                min="0"
                value={formData.loanAmountReceivable}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            {/* Loan Date */}
            <div className="space-y-2">
              <Label htmlFor="loanDate">Loan Date*</Label>
              <Input
                id="loanDate"
                name="loanDate"
                type="date"
                value={formData.loanDate}
                onChange={handleInputChange}
                required
              />
            </div>

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

export default Loans
