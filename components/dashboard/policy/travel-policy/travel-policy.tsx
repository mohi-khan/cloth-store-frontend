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
import { ArrowUpDown, Search, Plane } from 'lucide-react'
import { Popup } from '@/utils/popup'
import { format } from 'date-fns'
import type { CreateTaPolicyType, GetTaPolicyType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  useAddTaPolicyLevel,
  useEditTaPolicyLevel,
  useGetDesignations,
  useGetTaPolicyLevels,
} from '@/hooks/use-api'
import formatDate from '@/utils/formatDate'

const TaPolicyLevel = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: taPolicies } = useGetTaPolicyLevels()
  const { data: designations } = useGetDesignations()

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetTaPolicyType>('travelingCity')
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
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTaPolicy, setEditingTaPolicy] =
    useState<GetTaPolicyType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateTaPolicyType>({
    travelingCity: undefined,
    designationId: 0,
    accomodationAmount: 0,
    dailyAllowance: undefined,
    createdBy: userData?.userId || 0,
  })

  const handleSort = (column: keyof GetTaPolicyType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredTaPolicies = useMemo(() => {
    if (!taPolicies?.data) return []
    return taPolicies.data.filter((taPolicy: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        taPolicy.travelingCity?.toLowerCase().includes(searchLower) ||
        taPolicy.designationName?.toLowerCase().includes(searchLower) ||
        taPolicy.accomodationAmount?.toString().includes(searchLower) ||
        taPolicy.dailyAllowance?.toString().includes(searchLower)
      )
    })
  }, [taPolicies?.data, searchTerm])

  const sortedTaPolicies = useMemo(() => {
    return [...filteredTaPolicies].sort((a, b) => {
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
  }, [filteredTaPolicies, sortColumn, sortDirection])

  const paginatedTaPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedTaPolicies.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedTaPolicies, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedTaPolicies.length / itemsPerPage)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'accomodationAmount' || name === 'dailyAllowance'
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

  const handleEdit = (taPolicy: GetTaPolicyType) => {
    setIsEditMode(true)
    setEditingTaPolicy(taPolicy)
    setFormData({
      travelingCity: taPolicy.travelingCity,
      designationId: taPolicy.designationId,
      accomodationAmount: taPolicy.accomodationAmount,
      dailyAllowance: taPolicy.dailyAllowance,
      createdBy: userData?.userId || 0,
      updatedBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setEditingTaPolicy(null)
    resetForm()
    setIsPopupOpen(true)
  }

  const resetForm = useCallback(() => {
    setFormData({
      travelingCity: undefined,
      designationId: 0,
      accomodationAmount: 0,
      dailyAllowance: undefined,
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setIsEditMode(false)
    setEditingTaPolicy(null)
  }, [userData?.userId, setIsPopupOpen, setIsEditMode, setEditingTaPolicy])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null) // Clear any existing errors when closing
  }, [])

  const addMutation = useAddTaPolicyLevel({
    onClose: closePopup,
    reset: resetForm,
  })

  const editMutation = useEditTaPolicyLevel({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (isEditMode && editingTaPolicy) {
          e.preventDefault()
          setError(null) // Clear previous errors
          try {
            if (
              editingTaPolicy?.id === undefined ||
              editingTaPolicy?.travelingCity === undefined ||
              editingTaPolicy?.createdBy === undefined
            )
              return
            editMutation.mutate({
              id: editingTaPolicy.id,
              data: {
                ...formData,
                updatedBy: userData?.userId || 0,
                createdBy: editingTaPolicy.createdBy || 0,
                accomodationAmount: formData.accomodationAmount || 0,
                travelingCity: formData.travelingCity as
                  | 'Dhaka'
                  | 'Chittagong'
                  | 'Others',
                designationName:
                  designations?.data?.find(
                    (d) => d.designationID === formData.designationId
                  )?.designationName || '',
              },
            })
          } catch (err) {
            setError('Failed to edit company')
            console.error(err)
          }
        } else {
          e.preventDefault()
          setError(null) // Clear previous errors
          try {
            addMutation.mutate({
              ...formData,
              createdBy: userData?.userId || 0,
              accomodationAmount: formData.accomodationAmount || 0,
            })
          } catch (err) {
            setError('Failed to create company')
            console.error(err)
          }
        }
        resetForm()
      } catch (error) {
        console.error(
          `Error ${isEditMode ? 'updating' : 'creating'} TA policy:`,
          error
        )
      }
    },
    [
      formData,
      userData,
      isEditMode,
      editingTaPolicy,
      addMutation,
      editMutation,
      resetForm,
      designations?.data,
    ]
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Plane className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Travel Policy</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search TA policies..."
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
                onClick={() => handleSort('travelingCity')}
                className="cursor-pointer"
              >
                Traveling City <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('designationName')}
                className="cursor-pointer"
              >
                Designation <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('accomodationAmount')}
                className="cursor-pointer"
              >
                Accommodation Amount{' '}
                <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('dailyAllowance')}
                className="cursor-pointer"
              >
                Daily Allowance <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('createdAt')}
                className="cursor-pointer"
              >
                Created At <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!taPolicies || taPolicies.data === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading TA policies...
                </TableCell>
              </TableRow>
            ) : !taPolicies.data || taPolicies.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No TA policies found
                </TableCell>
              </TableRow>
            ) : paginatedTaPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No TA policies match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedTaPolicies.map((taPolicy) => (
                <TableRow key={taPolicy.id}>
                  <TableCell>{taPolicy.travelingCity}</TableCell>
                  <TableCell>{taPolicy.designationName}</TableCell>
                  <TableCell className="font-medium">
                    {taPolicy.accomodationAmount}
                  </TableCell>
                  <TableCell>{taPolicy.dailyAllowance}</TableCell>
                  <TableCell>{formatDate(taPolicy.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(taPolicy)}
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

      {sortedTaPolicies.length > 0 && (
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
        title={isEditMode ? 'Edit TA Policy' : 'Add TA Policy'}
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="travelingCity">Traveling City*</Label>
              <Select
                value={formData.travelingCity || ''}
                onValueChange={(value) =>
                  handleSelectChange('travelingCity', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select traveling city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dhaka">Dhaka</SelectItem>
                  <SelectItem value="Chittagong">Chittagong</SelectItem>
                  <SelectItem value="Sylhet">Sylhet</SelectItem>
                  <SelectItem value="Cox's bazar">Cox&apos;s Bazar</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
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
              <Label htmlFor="accomodationAmount">Accommodation Amount*</Label>
              <Input
                id="accomodationAmount"
                name="accomodationAmount"
                type="number"
                value={formData.accomodationAmount || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Enter accommodation amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyAllowance">Daily Allowance</Label>
              <Input
                id="dailyAllowance"
                name="dailyAllowance"
                type="number"
                value={formData.dailyAllowance || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Enter daily allowance (optional)"
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

export default TaPolicyLevel
