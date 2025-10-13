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
import { Popup } from '@/utils/popup'
import { DollarSign, ArrowUpDown, Search } from 'lucide-react'
import { format } from 'date-fns'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

import type {
  CreateReimbursementPolicyType,
  GetReimbursementPolicyType,
} from '@/utils/type'
import {
  useAddReimbursementPolicy,
  useEditReimbursementPolicy,
  useGetDesignations,
  useGetReimbursementPolicy,
} from '@/hooks/use-api'
import formatDate from '@/utils/formatDate'

const ReimbursementPolicies = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: designations } = useGetDesignations()
  const { data: reimbursementPolicies } = useGetReimbursementPolicy()
  console.log("🚀 ~ ReimbursementPolicies ~ reimbursementPolicies:", reimbursementPolicies)

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetReimbursementPolicyType>('type')
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

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingReimbursementPolicy, setEditingReimbursementPolicy] =
    useState<GetReimbursementPolicyType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateReimbursementPolicyType>({
    designationId: 0,
    type: 'medical',
    amountType: 'basic_salary',
    fixedAmount: 0,
    useWhicheverIsHigher: true,
    applicableTo: [],
    accumulableYears: undefined,
    createdBy: userData?.userId || 0,
  })

  const handleSort = (column: keyof GetReimbursementPolicyType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getDesignationName = useCallback(
    (designationId: number) => {
      const designation = designations?.data?.find(
        (d) => d.designationID === designationId
      )
      return designation ? designation.designationName : 'N/A'
    },
    [designations]
  )

  const filteredPolicies = useMemo(() => {
    if (!reimbursementPolicies?.data) return []
    return reimbursementPolicies.data.filter((policy: any) => {
      const searchLower = searchTerm.toLowerCase()
      const designationName = getDesignationName(policy.designationId)
      return (
        policy.type?.toLowerCase().includes(searchLower) ||
        designationName?.toLowerCase().includes(searchLower) ||
        policy.amountType?.toLowerCase().includes(searchLower) ||
        policy.applicableTo?.some((item: string) =>
          item.toLowerCase().includes(searchLower)
        )
      )
    })
  }, [reimbursementPolicies?.data, searchTerm, getDesignationName])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'fixedAmount' || name === 'accumulableYears'
          ? value === ''
            ? undefined
            : Number(value)
          : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'designationId' ? Number(value) : value,
    }))
  }

  const handleApplicableToChange = (value: 'self' | 'spouse' | 'children') => {
    setFormData((prev) => {
      const currentApplicableTo = prev.applicableTo || []
      if (currentApplicableTo.includes(value)) {
        return {
          ...prev,
          applicableTo: currentApplicableTo.filter((item) => item !== value),
        }
      } else {
        return {
          ...prev,
          applicableTo: [...currentApplicableTo, value],
        }
      }
    })
  }

  const handleUseWhicheverIsHigherChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      useWhicheverIsHigher: checked,
    }))
  }

  const handleEdit = (reimbursementPolicy: GetReimbursementPolicyType) => {
    setIsEditMode(true)
    setEditingReimbursementPolicy(reimbursementPolicy)
    setFormData({
      designationId: reimbursementPolicy.designationId,
      type: reimbursementPolicy.type,
      amountType: reimbursementPolicy.amountType,
      fixedAmount: reimbursementPolicy.fixedAmount,
      useWhicheverIsHigher: reimbursementPolicy.useWhicheverIsHigher,
      applicableTo: reimbursementPolicy.applicableTo,
      accumulableYears: reimbursementPolicy.accumulableYears,
      createdBy: reimbursementPolicy.createdBy,
      updatedBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setEditingReimbursementPolicy(null)
    resetForm()
    setIsPopupOpen(true)
  }

  const resetForm = useCallback(() => {
    setFormData({
      designationId: 0,
      type: 'medical',
      amountType: 'basic_salary',
      fixedAmount: 0,
      useWhicheverIsHigher: true,
      applicableTo: [],
      accumulableYears: undefined,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setIsEditMode(false)
    setEditingReimbursementPolicy(null)
  }, [
    setFormData,
    setIsPopupOpen,
    setIsEditMode,
    setEditingReimbursementPolicy,
    userData?.userId,
  ])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const addMutation = useAddReimbursementPolicy({
    onClose: closePopup,
    reset: resetForm,
  })

  const editMutation = useEditReimbursementPolicy({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (isEditMode && editingReimbursementPolicy) {
          e.preventDefault()
          setError(null)
          try {
            if (editingReimbursementPolicy?.id === undefined) {
              setError('Invalid reimbursement policy ID')
              return
            }
            editMutation.mutate({
              id: editingReimbursementPolicy.id,
              data: {
                ...formData,
                designationId: formData.designationId ?? 0,
                type: formData.type ?? 'medical',
                amountType: formData.amountType ?? 'basic_salary',
                fixedAmount: formData.fixedAmount || 0,
                useWhicheverIsHigher: formData.useWhicheverIsHigher ?? true,
                applicableTo: formData.applicableTo ?? [],
                accumulableYears: formData.accumulableYears,
                updatedBy: userData?.userId || 0,
                createdBy: editingReimbursementPolicy?.createdBy || 0,
              },
            })
          } catch (err) {
            setError('Failed to create company')
            console.error(err)
          }
        } else {
          e.preventDefault()
          setError(null)
          try {
            addMutation.mutate({
              ...formData,
              createdBy: userData?.userId || 0,
              fixedAmount: formData.fixedAmount || 0,
            })
          } catch (err) {
            setError('Failed to create company')
            console.error(err)
          }
        }
        resetForm()
      } catch (error) {
        console.error(
          `Error ${isEditMode ? 'updating' : 'creating'} reimbursement policy:`,
          error
        )
      }
    },
    [
      formData,
      userData,
      isEditMode,
      editingReimbursementPolicy,
      addMutation,
      editMutation,
      resetForm,
    ]
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <DollarSign className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Medical & Hospitalization</h2>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('type')}
                className="cursor-pointer"
              >
                Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('designationId')}
                className="cursor-pointer"
              >
                Designation <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('amountType')}
                className="cursor-pointer"
              >
                Amount Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('fixedAmount')}
                className="cursor-pointer"
              >
                Fixed Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('useWhicheverIsHigher')}
                className="cursor-pointer"
              >
                Use Whichever Is Higher{' '}
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              {/* <TableHead>Applicable To</TableHead> */}
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
            {!reimbursementPolicies ||
            reimbursementPolicies.data === undefined ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Loading reimbursement policies...
                </TableCell>
              </TableRow>
            ) : !reimbursementPolicies.data ||
              reimbursementPolicies.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No reimbursement policies found
                </TableCell>
              </TableRow>
            ) : paginatedPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No policies match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="capitalize">{policy.type}</TableCell>
                  <TableCell>
                    {getDesignationName(policy.designationId)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {policy.amountType.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {policy.fixedAmount}
                  </TableCell>
                  <TableCell>
                    {policy.useWhicheverIsHigher ? 'Yes' : 'No'}
                  </TableCell>
                  {/* <TableCell className="capitalize">
                    {policy.applicableTo.join(', ') || '-'}
                  </TableCell> */}
                  <TableCell>{policy.accumulableYears ?? '-'}</TableCell>
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

      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={
          isEditMode ? 'Edit Reimbursement Policy' : 'Add Reimbursement Policy'
        }
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Policy Type*</Label>
              <Select
                value={formData.type || ''}
                onValueChange={(value) => handleSelectChange('type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select policy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="hospitalization">
                    Hospitalization
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="amountType">Amount Type*</Label>
              <Select
                value={formData.amountType || ''}
                onValueChange={(value) =>
                  handleSelectChange('amountType', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select amount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic_salary">Basic Salary</SelectItem>
                  <SelectItem value="gross_salary">Gross Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fixedAmount">Fixed Amount (৳)*</Label>
              <Input
                id="fixedAmount"
                name="fixedAmount"
                type="number"
                value={formData.fixedAmount || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Enter fixed amount"
                required
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="useWhicheverIsHigher">
                Use Whichever Is Higher
              </Label>
              <Switch
                id="useWhicheverIsHigher"
                checked={formData.useWhicheverIsHigher}
                onChange={(e) =>
                  handleUseWhicheverIsHigherChange(e.target.checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Applicable To*</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="self"
                    checked={formData.applicableTo?.includes('self')}
                    onCheckedChange={() => handleApplicableToChange('self')}
                  />
                  <Label htmlFor="self">Self</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="spouse"
                    checked={formData.applicableTo?.includes('spouse')}
                    onCheckedChange={() => handleApplicableToChange('spouse')}
                  />
                  <Label htmlFor="spouse">Spouse</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="children"
                    checked={formData.applicableTo?.includes('children')}
                    onCheckedChange={() => handleApplicableToChange('children')}
                  />
                  <Label htmlFor="children">Children</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accumulableYears">
                Accumulable Years (Optional)
              </Label>
              <Input
                id="accumulableYears"
                name="accumulableYears"
                type="number"
                value={formData.accumulableYears || ''}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="Enter accumulable years"
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

export default ReimbursementPolicies
