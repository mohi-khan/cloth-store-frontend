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
import { ArrowUpDown, Search } from 'lucide-react'
import { Popup } from '@/utils/popup'
import { Space } from 'lucide-react'
import { format } from 'date-fns'
import type { CreateDesignationType, GetDesignationType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  useAddDesignation,
  useEditDesignation,
  useGetDesignations,
} from '@/hooks/use-api'
import formatDate from '@/utils/formatDate'

const Designations = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: designations } = useGetDesignations()

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetDesignationType>('designationName')
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
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingDesignation, setEditingDesignation] =
    useState<GetDesignationType | null>(null)
  const [error, setError] = useState<string | null>(null)

  // State for form data
  const [formData, setFormData] = useState<CreateDesignationType>({
    designationCode: '',
    designationName: '',
    grade: '',
    createdBy: userData?.userId || 0,
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSort = (column: keyof GetDesignationType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredDesignations = useMemo(() => {
    if (!designations?.data) return []
    return designations.data.filter((designation: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        designation.designationCode?.toLowerCase().includes(searchLower) ||
        designation.designationName?.toLowerCase().includes(searchLower) ||
        designation.grade?.toLowerCase().includes(searchLower)
      )
    })
  }, [designations?.data, searchTerm])

  const sortedDesignations = useMemo(() => {
    return [...filteredDesignations].sort((a, b) => {
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
  }, [filteredDesignations, sortColumn, sortDirection])

  const paginatedDesignations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedDesignations.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedDesignations, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedDesignations.length / itemsPerPage)

  // Handle edit button click
  const handleEdit = (designation: GetDesignationType) => {
    setIsEditMode(true)
    setEditingDesignation(designation)
    setFormData({
      designationCode: designation.designationCode,
      designationName: designation.designationName,
      grade: designation.grade || '',
      createdBy: userData?.userId || 0,
      updatedBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  // Handle add button click
  const handleAdd = () => {
    setIsEditMode(false)
    setEditingDesignation(null)
    resetForm()
    setIsPopupOpen(true)
  }

  const resetForm = useCallback(() => {
    setFormData({
      designationCode: '',
      designationName: '',
      grade: '',
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setIsEditMode(false)
    setEditingDesignation(null)
  }, [userData?.userId, setIsPopupOpen, setIsEditMode, setEditingDesignation])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null) // Clear any existing errors when closing
  }, [])

  const addMutation = useAddDesignation({
    onClose: closePopup,
    reset: resetForm,
  })

  const editMutation = useEditDesignation({
    onClose: closePopup,
    reset: resetForm,
  })

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        if (isEditMode && editingDesignation) {
          e.preventDefault()
          setError(null) // Clear previous errors
          try {
            if (editingDesignation?.designationID === undefined) {
              setError('Invalid designation ID')
              return
            }
            editMutation.mutate({
              id: editingDesignation.designationID,
              data: {
                ...formData,
                updatedBy: userData?.userId || 0,
                grade: formData.grade?.trim() || undefined,
              },
            })
          } catch (err) {
            setError('Failed to create company')
            console.error(err)
          }
        } else {
          e.preventDefault()
          setError(null) // Clear previous errors
          try {
            addMutation.mutate({
              ...formData,
              createdBy: userData?.userId || 0,
              // Remove empty grade if not provided
              grade: formData.grade?.trim() || undefined,
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
          `Error ${isEditMode ? 'updating' : 'creating'} designation:`,
          error
        )
      }
    },
    [
      formData,
      userData,
      isEditMode,
      editingDesignation,
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
            <Space className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Designations</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search designations..."
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

      {/* Table for designation data */}
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('designationCode')}
                className="cursor-pointer"
              >
                Designation Code <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('designationName')}
                className="cursor-pointer"
              >
                Designation Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('grade')}
                className="cursor-pointer"
              >
                Grade <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
            {!designations || designations.data === undefined ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading designations...
                </TableCell>
              </TableRow>
            ) : !designations.data || designations.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No designations found
                </TableCell>
              </TableRow>
            ) : paginatedDesignations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No designations match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedDesignations.map((designation) => (
                <TableRow key={designation.designationID}>
                  <TableCell>{designation.designationCode}</TableCell>
                  <TableCell>{designation.designationName}</TableCell>
                  <TableCell>{designation.grade || '-'}</TableCell>
                  <TableCell>{formatDate(designation.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(designation)}
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

      {sortedDesignations.length > 0 && (
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
        title={isEditMode ? 'Edit Designation' : 'Add Designation'}
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="designationCode">Designation Code*</Label>
              <Input
                id="designationCode"
                name="designationCode"
                value={formData.designationCode}
                onChange={handleInputChange}
                maxLength={255}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designationName">Designation Name*</Label>
              <Input
                id="designationName"
                name="designationName"
                value={formData.designationName}
                onChange={handleInputChange}
                maxLength={255}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                maxLength={50}
                placeholder="Optional"
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

export default Designations
