'use client'

import type React from 'react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Popup } from '@/utils/popup' // Assuming Popup component exists
import { Smartphone } from 'lucide-react' // Changed icon to Smartphone for mobile allowance
import { format } from 'date-fns'
import type {
  CreateMobileAllowancePolicyType,
  GetMobileAllowancePolicyType,
} from '@/utils/type' // Updated type imports
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user' // Assuming these utilities exist
import { useAtom } from 'jotai' // Assuming jotai is installed
import { useRouter } from 'next/navigation'
import {
  useAddMobileAllowancePolicy,
  useEditMobileAllowancePolicy,
  useGetDesignations,
  useGetMobileAllowancePolicy,
} from '@/hooks/use-api'
import formatDate from '@/utils/formatDate'

const MobileAllowancePolicyLevel = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: designations } = useGetDesignations()
  const { data: mobileAllowancePolicies } = useGetMobileAllowancePolicy()

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetMobileAllowancePolicyType>('designationId')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

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

  // State for popup visibility and mode
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMobileAllowancePolicy, setEditingMobileAllowancePolicy] =
    useState<GetMobileAllowancePolicyType | null>(null)
  const [error, setError] = useState<string | null>(null)

  // State for form data
  const [formData, setFormData] = useState<CreateMobileAllowancePolicyType>({
    designationId: 0,
    isSales: false,
    amount: 0,
    remarks: undefined,
    accumulableYears: undefined,
    createdBy: userData?.userId || 0,
  })

  const handleSort = (column: keyof GetMobileAllowancePolicyType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredPolicies = useMemo(() => {
    if (!mobileAllowancePolicies?.data) return []
    return mobileAllowancePolicies.data.filter((policy: any) => {
      const searchLower = searchTerm.toLowerCase()
      const designationName =
        designations?.data?.find(
          (d) => d.designationID === policy.designationId
        )?.designationName || ''

      return (
        designationName.toLowerCase().includes(searchLower) ||
        policy.amount?.toString().includes(searchLower) ||
        policy.remarks?.toLowerCase().includes(searchLower) ||
        policy.accumulableYears?.toString().includes(searchLower) ||
        (policy.isSales ? 'yes' : 'no').includes(searchLower)
      )
    })
  }, [mobileAllowancePolicies?.data, searchTerm, designations?.data])

  const sortedPolicies = useMemo(() => {
    return [...filteredPolicies].sort((a, b) => {
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
  }, [filteredPolicies, sortColumn, sortDirection])

  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedPolicies.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedPolicies, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedPolicies.length / itemsPerPage)

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'amount' || name === 'accumulableYears'
          ? value === ''
            ? undefined
            : Number(value)
          : value,
    }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'designationId'
          ? Number(value)
          : name === 'isSales'
            ? value === 'true'
            : value,
    }))
  }

  // Handle edit button click
  const handleEdit = (mobileAllowancePolicy: GetMobileAllowancePolicyType) => {
    setIsEditMode(true)
    setEditingMobileAllowancePolicy(mobileAllowancePolicy)
    setFormData({
      designationId: mobileAllowancePolicy.designationId,
      isSales: mobileAllowancePolicy.isSales,
      amount: mobileAllowancePolicy.amount,
      remarks: mobileAllowancePolicy.remarks,
      accumulableYears: mobileAllowancePolicy.accumulableYears,
      createdBy: mobileAllowancePolicy.createdBy, // Keep original createdBy for edit
      updatedBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  // Handle add button click
  const handleAdd = () => {
    setIsEditMode(false)
    setEditingMobileAllowancePolicy(null)
    resetForm()
    setIsPopupOpen(true)
  }

  const resetForm = useCallback(() => {
    setFormData({
      designationId: 0,
      isSales: false,
      amount: 0,
      remarks: undefined,
      accumulableYears: undefined,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setIsEditMode(false)
    setEditingMobileAllowancePolicy(null)
  }, [
    userData?.userId,
    setIsPopupOpen,
    setIsEditMode,
    setEditingMobileAllowancePolicy,
  ])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null) // Clear any existing errors when closing
  }, [])

  const addMutation = useAddMobileAllowancePolicy({
    onClose: closePopup,
    reset: resetForm,
  })

  const editMutation = useEditMobileAllowancePolicy({
    onClose: closePopup,
    reset: resetForm,
  })

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (isEditMode && editingMobileAllowancePolicy) {
          try {
            if (editingMobileAllowancePolicy?.id === undefined) {
              setError('Invalid policy ID')
              return
            }
            editMutation.mutate({
              id: editingMobileAllowancePolicy.id,
              data: {
                ...formData,
                designationId: formData.designationId ?? 0,
                isSales: formData.isSales ?? false,
                updatedBy: userData?.userId || 0,
                createdBy: editingMobileAllowancePolicy?.createdBy || 0,
                // Ensure amount is provided
                amount: formData.amount || 0,
              },
            })
          } catch (err) {
            setError('Failed to create company')
            console.error(err)
          }
        } else {
          setError(null) // Clear previous errors
          try {
            addMutation.mutate({
              ...formData,
              createdBy: userData?.userId || 0,
              // Ensure amount is provided
              amount: formData.amount || 0,
            })
          } catch (err) {
            setError('Failed to create company')
            console.error(err)
          }
        }
        // Reset form and close popup
        resetForm()
      } catch (error) {
        console.error(
          `Error ${isEditMode ? 'updating' : 'creating'} Mobile Allowance policy:`,
          error
        )
      }
    },
    [
      formData,
      userData,
      isEditMode,
      editingMobileAllowancePolicy,
      addMutation,
      editMutation,
      resetForm,
    ]
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Smartphone className="text-amber-600" /> {/* Changed icon */}
          </div>
          <h2 className="text-lg font-semibold">
            Mobile Handset Policy Levels
          </h2>
          {/* Updated title */}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={handleAdd}
          >
            Add
          </Button>
        </div>
      </div>
      {/* Table for Mobile Allowance policy data */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('designationId')}
                className="cursor-pointer"
              >
                Designation <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('isSales')}
                className="cursor-pointer"
              >
                Is Sales <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('amount')}
                className="cursor-pointer"
              >
                Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('remarks')}
                className="cursor-pointer"
              >
                Remarks <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('accumulableYears')}
                className="cursor-pointer"
              >
                Accumulable Years{' '}
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('createdAt')}
                className="cursor-pointer"
              >
                Created At <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!mobileAllowancePolicies ||
            mobileAllowancePolicies.data === undefined ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading Mobile Allowance policies...
                </TableCell>
              </TableRow>
            ) : !mobileAllowancePolicies.data ||
              mobileAllowancePolicies.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No Mobile Allowance policies found
                </TableCell>
              </TableRow>
            ) : paginatedPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No policies match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    {
                      designations?.data?.find(
                        (d) => d.designationID === policy.designationId
                      )?.designationName
                    }
                  </TableCell>
                  <TableCell>{policy.isSales ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="font-medium">{policy.amount}</TableCell>
                  <TableCell>{policy.remarks || '-'}</TableCell>
                  <TableCell>{policy.accumulableYears || '-'}</TableCell>
                  <TableCell>{formatDate(policy.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(policy)}
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

      {sortedPolicies.length > 0 && (
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

      {/* Popup with form */}
      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={
          isEditMode
            ? 'Edit Mobile Allowance Policy'
            : 'Add Mobile Allowance Policy'
        }
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation*</Label>
              <Select
                value={
                  formData.designationId ? String(formData.designationId) : ''
                }
                onValueChange={(value) =>
                  handleSelectChange('designationId', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations?.data?.map((designation) => (
                    <SelectItem
                      key={designation.designationID}
                      value={String(designation.designationID)}
                    >
                      {designation.designationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isSales">Is Sales*</Label>
              <Select
                value={String(formData.isSales)}
                onValueChange={(value) => handleSelectChange('isSales', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select if sales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (৳)*</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                name="remarks"
                type="text"
                value={formData.remarks || ''}
                onChange={handleInputChange}
                placeholder="Enter remarks (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accumulableYears">Accumulable Years</Label>
              <Input
                id="accumulableYears"
                name="accumulableYears"
                type="number"
                value={formData.accumulableYears || ''}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="Enter accumulable years (optional)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default MobileAllowancePolicyLevel
