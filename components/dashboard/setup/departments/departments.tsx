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
import { Users } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import type { CreateDepartmentType, GetDepartmentType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  useAddDepartment,
  useGetCompanies,
  useGetDepartments,
} from '@/hooks/use-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import formatDate from '@/utils/formatDate'

const Departments = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: departments } = useGetDepartments()
  const { data: companies } = useGetCompanies()

  const router = useRouter()

  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GetDepartmentType>('departmentName')
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

  const [formData, setFormData] = useState<CreateDepartmentType>({
    departmentName: '',
    budget: undefined,
    companyCode: undefined,
    isActive: true,
    startDate: new Date(),
    endDate: null,
    createdBy: userData?.userId || 0,
    actual: undefined,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }))
    } else if (type === 'date') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? new Date(value) : null,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }))
  }

  const resetForm = () => {
    setFormData({
      departmentName: '',
      budget: undefined,
      companyCode: undefined,
      isActive: true,
      startDate: new Date(),
      endDate: null,
      createdBy: userData?.userId || 0,
      actual: undefined,
    })
    setIsPopupOpen(false)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null) // Clear any existing errors when closing
  }, [])

  const mutation = useAddDepartment({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSort = (column: keyof GetDepartmentType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredDepartments = useMemo(() => {
    if (!departments?.data) return []
    return departments.data.filter((department: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        department.departmentName?.toLowerCase().includes(searchLower) ||
        department.companyName?.toLowerCase().includes(searchLower) ||
        department.budget?.toString().includes(searchLower) ||
        department.actual?.toString().includes(searchLower)
      )
    })
  }, [departments?.data, searchTerm])

  const sortedDepartments = useMemo(() => {
    return [...filteredDepartments].sort((a, b) => {
      if (sortColumn === 'isActive') {
        return sortDirection === 'asc'
          ? a.isActive === b.isActive
            ? 0
            : a.isActive
              ? -1
              : 1
          : a.isActive === b.isActive
            ? 0
            : a.isActive
              ? 1
              : -1
      }

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
  }, [filteredDepartments, sortColumn, sortDirection])

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedDepartments.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedDepartments, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear previous errors

    try {
      mutation.mutate({
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
      })
    } catch (err) {
      setError('Failed to create company')
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) {
      setError('Error adding company')
    }
  }, [mutation.error])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number.parseInt(value) : null,
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Users className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Departments</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search departments..."
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

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('departmentName')}
                className="cursor-pointer"
              >
                Department Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('budget')}
                className="cursor-pointer"
              >
                Budget <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('companyName')}
                className="cursor-pointer"
              >
                Company <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('isActive')}
                className="cursor-pointer"
              >
                Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('startDate')}
                className="cursor-pointer"
              >
                Start Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('endDate')}
                className="cursor-pointer"
              >
                End Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('actual')}
                className="cursor-pointer"
              >
                Actual <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!departments || departments.data === undefined ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading departments...
                </TableCell>
              </TableRow>
            ) : !departments.data || departments.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No departments found
                </TableCell>
              </TableRow>
            ) : paginatedDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No departments match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedDepartments.map((department) => (
                <TableRow key={department.departmentID}>
                  <TableCell>{department.departmentName}</TableCell>
                  <TableCell>{department.budget ?? '-'}</TableCell>
                  <TableCell>{department.companyName ?? '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        department.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {department.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(department.startDate)}</TableCell>
                  <TableCell>{formatDate(department.endDate)}</TableCell>
                  <TableCell>{department.actual ?? '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedDepartments.length > 0 && (
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
        title="Add Department"
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department Name*</Label>
              <Input
                id="departmentName"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget ?? ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyCode">Parent Company</Label>
              <Select
                value={formData.companyCode ? String(formData.companyCode) : ''}
                onValueChange={(value) =>
                  handleSelectChange('companyCode', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.data?.map((company) => (
                    <SelectItem
                      key={company.companyId}
                      value={String(company.companyId)}
                    >
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual">Actual</Label>
              <Input
                id="actual"
                name="actual"
                type="number"
                value={formData.actual ?? ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={
                    formData.startDate
                      ? format(new Date(formData.startDate), 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={
                    formData.endDate
                      ? format(new Date(formData.endDate), 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive ?? false}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="isActive">Active</Label>
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

export default Departments
