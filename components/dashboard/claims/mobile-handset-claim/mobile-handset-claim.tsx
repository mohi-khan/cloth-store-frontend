'use client'

import type React from 'react'
import { useState, useCallback, useMemo, useEffect } from 'react'
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
  useGetClaim,
  useAddClaim,
  useApproveClaim,
  useGetEmployee,
  useGetClaimBalance,
  useIsNewClaimPossible,
  useGetEmployeesBySearch,
  useGetEmployeeClaim,
} from '@/hooks/use-api'
import type { CreateClaimType, GetClaimType } from '@/utils/type'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CustomCombobox } from '@/utils/custom-combobox'
import formatDate from '@/utils/formatDate'
import { Textarea } from '@/components/ui/textarea'
import { EmployeeDetails } from '../medical-claim/employeeDetails'
import EmployeeClaimsGrid from '../medical-claim/employeeClaimGrid'
import {
  ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'

const MobileHandsetClaim = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const { data: rawClaims } = useGetClaim()

  // filter only Mobile Handset claims
  const claims = useMemo(() => {
    return (
      rawClaims?.data?.filter(
        (claim) => claim.claimType === 'Mobile Handset'
      ) ?? []
    )
  }, [rawClaims])

  console.log('🚀 ~ MobileHandsetClaim ~ mobileHandsetClaims:', claims)

  console.log('🚀 ~ Claim ~ claims:', claims)
  // const { data: employees } = useGetEmployee()
  // console.log('🚀 ~ Claim ~ employees:', employees)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetClaimType>('employeeName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [claimAmountError, setClaimAmountError] = useState('')
  const [search, setSearch] = useState('')

  const { data: employees } = useGetEmployeesBySearch(search)
  console.log('🚀 ~ TravelClaims ~ employees:', employees)

  const [formData, setFormData] = useState<CreateClaimType>({
    empId: 0,
    designationId: 0,
    departmentId: 0,
    claimType: 'Mobile Handset',
    claimDate: new Date(),
    balance: 0,
    claimAmount: 0,
    afterBalance: 0,
    notes: '',
    handSetName: '',
    totalPrice: 0,
    isApproved: false,
    createdBy: userData?.userId || 0,
    updatedBy: null,
  })

  const shouldUseClaimBalance =
    formData.claimType === 'Medicine' || formData.claimType === 'Hospital'
  const shouldUseNewClaimPossible = formData.claimType === 'Mobile Handset'

  const { data: claimBalance } = useGetClaimBalance(
    shouldUseClaimBalance ? formData?.empId : 0,
    shouldUseClaimBalance ? formData?.claimType : 'Mobile Handset'
  )
  console.log('🚀 ~ Claim ~ claimBalance:', claimBalance)

  const { data: isNewClaimPossible } = useIsNewClaimPossible(
    shouldUseNewClaimPossible ? formData?.empId : 0,
    shouldUseNewClaimPossible ? formData?.claimAmount : 0
  )
  console.log('🚀 ~ Claim ~ isNewClaimPossible:', isNewClaimPossible)

  const { data: employeeClaim } = useGetEmployeeClaim(
    shouldUseClaimBalance ? formData?.empId : 0,
    shouldUseClaimBalance ? formData?.claimType : 'Medicine'
  )

  useEffect(() => {
    if (shouldUseClaimBalance && claimBalance?.data?.balance !== undefined) {
      setFormData((prev) => ({
        ...prev,
        balance: Number(claimBalance?.data?.balance),
      }))
    } else if (formData.empId === 0) {
      setFormData((prev) => ({
        ...prev,
        balance: 0,
      }))
    }
  }, [claimBalance?.data, formData.empId, shouldUseClaimBalance])

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const resetForm = () => {
    setFormData({
      empId: 0,
      designationId: 0,
      departmentId: 0,
      claimType: 'Mobile Handset',
      claimDate: new Date(),
      balance: 0,
      claimAmount: 0,
      afterBalance: 0,
      notes: '',
      handSetName: '',
      totalPrice: 0,
      isApproved: false,
      createdBy: userData?.userId || 0,
      updatedBy: null,
    })
    setIsPopupOpen(false)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  const addMutation = useAddClaim({
    onClose: closePopup,
    reset: resetForm,
  })

  const approveMutation = useApproveClaim({
    onClose: () => {},
    reset: () => {},
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value
            ? Number(value)
            : 0
          : name === 'claimDate'
            ? new Date(value)
            : value,
    }))

    if (name === 'claimAmount') {
      setClaimAmountError('')
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'claimType') {
      setFormData((prev) => ({
        ...prev,
        [name]: value as 'Medicine' | 'Hospital' | 'Travel' | 'Mobile Handset',
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let canSubmit = false
    let errorMessage = ''

    if (shouldUseClaimBalance) {
      if (formData.balance <= 0) {
        errorMessage = 'Cannot submit claim when balance is 0 or negative'
      } else if (formData.balance - formData.claimAmount < 0) {
        errorMessage =
          'Cannot submit claim when after balance would be negative'
      } else if (formData.balance >= formData.claimAmount) {
        canSubmit = true
      } else {
        errorMessage = 'Claim amount exceeds available balance'
      }
    } else if (shouldUseNewClaimPossible) {
      if (isNewClaimPossible?.data?.eligible === true) {
        canSubmit = true
      } else {
        errorMessage =
          isNewClaimPossible?.data?.reason ||
          'New mobile handset claim is not possible at this time'
      }
    } else {
      canSubmit = true
    }

    if (canSubmit) {
      addMutation.mutate({
        ...formData,
        createdBy: userData?.userId || 0,
      })
    } else {
      setClaimAmountError(errorMessage)
    }
    console.log('🚀 ~ handleSubmit ~ formData:', formData)
  }

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id })
  }

  const handleSort = (column: keyof GetClaimType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredClaims = useMemo(() => {
    if (!claims) return []
    return claims.filter((claim: GetClaimType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        claim.employeeName?.toLowerCase().includes(searchLower) ||
        claim.designationName?.toLowerCase().includes(searchLower) ||
        claim.departmentName?.toLowerCase().includes(searchLower) ||
        claim.claimType?.toLowerCase().includes(searchLower) ||
        claim.notes?.toLowerCase().includes(searchLower)
      )
    })
  }, [claims, searchTerm])

  const sortedClaims = useMemo(() => {
    return [...filteredClaims].sort((a, b) => {
      if (sortColumn === 'isApproved') {
        return sortDirection === 'asc'
          ? a.isApproved === b.isApproved
            ? 0
            : a.isApproved
              ? -1
              : 1
          : a.isApproved === b.isApproved
            ? 0
            : a.isApproved
              ? 1
              : -1
      }

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
  }, [filteredClaims, sortColumn, sortDirection])

  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedClaims.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedClaims, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedClaims.length / itemsPerPage)

  const items: ComboboxItem[] =
    employees?.data?.map((emp: any) => ({
      id: emp?.id !== undefined ? emp.id.toString() : '',
      name: `${emp.empId} - ${emp.name} - ${emp.designationName} - ${emp.departmentName}`,
    })) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Mobile Handset Claim</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search claims..."
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
                onClick={() => handleSort('employeeName')}
                className="cursor-pointer"
              >
                Employee <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('designationName')}
                className="cursor-pointer"
              >
                Designation <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('departmentName')}
                className="cursor-pointer"
              >
                Department <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('claimType')}
                className="cursor-pointer"
              >
                Claim Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('claimDate')}
                className="cursor-pointer"
              >
                Claim Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('claimDate')}
                className="cursor-pointer"
              >
                Post Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('balance')}
                className="cursor-pointer"
              >
                Balance <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('claimAmount')}
                className="cursor-pointer"
              >
                Claim Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('notes')}
                className="cursor-pointer"
              >
                Notes <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              {/* <TableHead
                onClick={() => handleSort('isApproved')}
                className="cursor-pointer"
              >
                Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!claims || claims === undefined ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  Loading claims...
                </TableCell>
              </TableRow>
            ) : !claims || claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No claims found
                </TableCell>
              </TableRow>
            ) : paginatedClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No claims match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedClaims.map((claim: GetClaimType) => (
                <TableRow key={claim.claimId}>
                  <TableCell>{claim.employeeName}</TableCell>
                  <TableCell>{claim.designationName}</TableCell>
                  <TableCell>{claim.departmentName}</TableCell>
                  <TableCell>{claim.claimType}</TableCell>
                  <TableCell>{formatDate(claim.claimDate)}</TableCell>
                  <TableCell>{formatDate(claim.createdAt)}</TableCell>
                  <TableCell>{claim.balance}</TableCell>
                  <TableCell>{claim.claimAmount}</TableCell>
                  <TableCell>{claim.notes ?? '-'}</TableCell>
                  {/* <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        claim.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {claim.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {
                      <Button
                        variant="outline"
                        disabled={claim.isApproved}
                        size="sm"
                        onClick={() =>
                          claim.claimId && handleApprove(claim.claimId)
                        }
                      >
                        Approve
                      </Button>
                    }
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedClaims.length > 0 && (
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

      {/* Popup Form */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title="Add Mobile Handset Claim"
        size="sm:max-w-6xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empId">Employee</Label>
              <CustomComboboxWithApi<ComboboxItem> //this is alternative with search api
                items={items}
                value={
                  formData.empId
                    ? (() => {
                        const emp = employees?.data?.find(
                          (e: any) => e.id === formData.empId
                        )
                        return emp
                          ? {
                              id: emp.id !== undefined ? emp.id.toString() : '',
                              name: `${emp.empId} - ${emp.name} - ${emp.designationName} - ${emp.departmentName}`,
                            }
                          : { id: formData.empId.toString(), name: '' }
                      })()
                    : null
                }
                onChange={(item) => {
                  if (!item) {
                    setFormData((prev) => ({
                      ...prev,
                      empId: 0,
                      designationId: 0,
                    }))
                    return
                  }
                  const selectedEmp = employees?.data?.find(
                    (e: any) => e.id === Number(item.id)
                  )
                  setFormData((prev) => ({
                    ...prev,
                    empId: Number(item.id),
                    designationId: selectedEmp?.designationId || 0,
                  }))
                }}
                placeholder="Select employee"
                searchFunction={async (query: string) => {
                  setSearch(query) // 🔑 triggers useGetEmployeesBySearch
                  return items
                }}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="claimType">Claim Type</Label>
              <Select
                value={formData.claimType}
                onValueChange={(value) =>
                  handleSelectChange('claimType', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile Handset">Mobile Handset</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="handSetName">Handset Name</Label>
              <Input
                id="handSetName"
                name="handSetName"
                type="text"
                value={formData.handSetName ?? ''}
                onChange={handleInputChange}
                placeholder="Enter handset name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">Total Price</Label>
              <Input
                id="totalPrice"
                name="totalPrice"
                type="number"
                value={formData.totalPrice ?? 0}
                onChange={handleInputChange}
                placeholder="Enter total price"
                required
              />
            </div>
          </div>
          {employees?.data && (
            <EmployeeDetails
              empId={formData.empId}
              employees={employees.data}
            />
          )}
          {formData.empId > 0 && formData.claimType && (
            <EmployeeClaimsGrid
              employeeClaim={
                Array.isArray(employeeClaim?.data) ? employeeClaim.data : []
              }
            />
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="claimDate">Bill Date</Label>
              <Input
                id="claimDate"
                name="claimDate"
                type="date"
                value={
                  formData.claimDate
                    ? new Date(formData.claimDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postingDate">Posting Date</Label>
              <Input
                id="postingDate"
                name="postingDate"
                type="date"
                value={new Date().toISOString().split('T')[0]}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Balance</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                disabled
                value={formData.balance}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimAmount">Claim Amount</Label>
              <Input
                id="claimAmount"
                name="claimAmount"
                type="number"
                value={formData.claimAmount}
                onChange={handleInputChange}
                className={
                  claimAmountError ? 'border-red-500 focus:border-red-500' : ''
                }
                min={1}
                required
              />
              {claimAmountError && (
                <p className="text-sm text-red-500">{claimAmountError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="afterBalance">After Balance</Label>
              <Input
                id="afterBalance"
                name="afterBalance"
                type="number"
                disabled
                value={formData.balance - formData.claimAmount}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default MobileHandsetClaim
