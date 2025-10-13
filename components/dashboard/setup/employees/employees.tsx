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
import { UserCheck } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import {
  useAddEmployee,
  useGetEmployee,
  useGetCompanies,
  useGetDepartments,
  useGetDesignations,
  useEditEmployee,
} from '@/hooks/use-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreateEmployeeType, GetEmployeeType } from '@/utils/type'
import { format } from 'date-fns'

const Employees = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: employees } = useGetEmployee()
  // console.log('🚀 ~ Employees ~ employees:', employees?.data)
  const { data: companies } = useGetCompanies()
  const { data: departments } = useGetDepartments()
  const { data: designations } = useGetDesignations()
  // console.log('🚀 ~ Employees ~ designations:', designations?.data)

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GetEmployeeType>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEmployee, setEditingEmployee] =
    useState<GetEmployeeType | null>(null)

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

  const [formData, setFormData] = useState<CreateEmployeeType>({
    empId: undefined,
    name: '',
    designationId: undefined,
    departmentId: undefined,
    empCat: undefined as any,
    empType: undefined as any,
    companyName: '',
    employeeGroup: undefined as any,
    status: true,
    gender: undefined as any,
    basicSalary: 0.0,
    grossSalary: 0.0,
    dateOfBirth: new Date(),
    dateOfJoining: new Date(),
    dateOfConfirmation: new Date(),
    mobileNumber: '',
    location: '',
    createdBy: userData?.userId || 0,
    updatedBy: undefined,
  })

  const handleSort = (column: keyof GetEmployeeType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredEmployees = useMemo(() => {
    if (!employees?.data) return []
    return employees.data.filter((employee: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        employee.empId?.toString().includes(searchLower) ||
        employee.name?.toLowerCase().includes(searchLower) ||
        employee.designationName?.toLowerCase().includes(searchLower) ||
        employee.departmentName?.toLowerCase().includes(searchLower) ||
        employee.companyName?.toLowerCase().includes(searchLower) ||
        employee.empCat?.toLowerCase().includes(searchLower) ||
        employee.empType?.toLowerCase().includes(searchLower) ||
        employee.location?.toLowerCase().includes(searchLower)
      )
    })
  }, [employees?.data, searchTerm])

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
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
  }, [filteredEmployees, sortColumn, sortDirection])

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedEmployees.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedEmployees, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
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
      status: checked,
    }))
  }

  const resetForm = () => {
    setFormData({
      empId: undefined,
      name: '',
      designationId: undefined,
      departmentId: undefined,
      empCat: undefined as any,
      empType: undefined as any,
      companyName: '',
      employeeGroup: undefined as any,
      status: true,
      gender: undefined as any,
      basicSalary: 0.0,
      grossSalary: 0.0,
      dateOfBirth: new Date(),
      dateOfJoining: new Date(),
      dateOfConfirmation: new Date(),
      mobileNumber: '',
      location: '',
      createdBy: userData?.userId || 0,
      updatedBy: undefined,
    })
    setIsEditMode(false)
    setEditingEmployee(null)
    setError(null)
    setIsPopupOpen(false)
  }

  const handleAddNew = () => {
    setIsEditMode(false)
    setEditingEmployee(null)
    setError(null)
    setFormData({
      empId: undefined,
      name: '',
      designationId: undefined,
      departmentId: undefined,
      empCat: undefined as any,
      empType: undefined as any,
      companyName: '',
      employeeGroup: undefined as any,
      status: true,
      gender: undefined as any,
      basicSalary: 0.0,
      grossSalary: 0.0,
      dateOfBirth: new Date(),
      dateOfJoining: new Date(),
      dateOfConfirmation: new Date(),
      mobileNumber: '',
      location: '',
      createdBy: userData?.userId || 0,
      updatedBy: undefined,
    })
    setIsPopupOpen(true)
  }

  const handleEdit = (employee: GetEmployeeType) => {
    setIsEditMode(true)
    setEditingEmployee(employee)
    setError(null)
    setFormData({
      empId: employee.empId,
      name: employee.name,
      designationId: employee.designationId,
      departmentId: employee.departmentId,
      empCat: employee.empCat,
      empType: employee.empType,
      companyName: employee.companyName,
      employeeGroup: employee.employeeGroup,
      status: employee.status,
      gender: employee.gender,
      basicSalary: employee.basicSalary,
      grossSalary: employee.grossSalary,
      dateOfBirth: (employee as any).dateOfBirth || '',
      dateOfJoining: (employee as any).dateOfJoining || '',
      dateOfConfirmation: (employee as any).dateOfConfirmation || '',
      mobileNumber: (employee as any).mobileNumber || '',
      location: (employee as any).location || '',
      createdBy: employee.createdBy,
      updatedBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const addMutation = useAddEmployee({
    onClose: closePopup,
    reset: resetForm,
  })

  const editMutation = useEditEmployee({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      try {
        if (isEditMode && editingEmployee) {
          if (editingEmployee?.id === undefined) {
            setError('Invalid employee ID')
            return
          }
          editMutation.mutate({
            id: editingEmployee.id,
            data: {
              ...formData,
              updatedBy: userData?.userId || 0,
              createdBy: editingEmployee.createdBy,
              designationId: formData.designationId || 0,
              departmentId: formData.departmentId || 0,
              empCat: formData.empCat || (undefined as any),
              empType: formData.empType || (undefined as any),
              employeeGroup: formData.employeeGroup || (undefined as any),
              gender: formData.gender || (undefined as any),
              basicSalary: formData.basicSalary || 0,
              grossSalary: formData.grossSalary || 0,
              companyName: formData.companyName || '',
              status: formData.status || true,
              empId: formData.empId || '',
              name: formData.name || '',
              dateOfBirth: formData.dateOfBirth || new Date(),
              dateOfJoining: formData.dateOfJoining || new Date(),
              dateOfConfirmation: formData.dateOfConfirmation || new Date(),
              mobileNumber: formData.mobileNumber || '',
              location: formData.location || '',
            },
          })
        } else {
          addMutation.mutate({
            ...formData,
            empId: String(formData.empId) || '',
            createdBy: userData?.userId || 0,
            companyName: String(formData.companyName) || '',
          })
          console.log('🚀 ~ Employees ~ formData:', formData)
        }
      } catch (error) {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} employee`)
        console.error(
          `Error ${isEditMode ? 'updating' : 'creating'} employee:`,
          error
        )
      }
    },
    [formData, userData, isEditMode, editingEmployee, addMutation, editMutation]
  )

  const handleSelectChange = (name: string, value: string) => {
    if (
      name === 'empCat' ||
      name === 'empType' ||
      name === 'employeeGroup' ||
      name === 'gender' ||
      name === 'companyName'
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number.parseInt(value) : undefined,
      }))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <UserCheck className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Employees</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={handleAddNew}
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
                onClick={() => handleSort('empId')}
                className="cursor-pointer"
              >
                Employee ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('name')}
                className="cursor-pointer"
              >
                Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
                onClick={() => handleSort('companyName')}
                className="cursor-pointer"
              >
                Company <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('companyName')}
                className="cursor-pointer"
              >
                Location <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('empCat')}
                className="cursor-pointer"
              >
                Category <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('empType')}
                className="cursor-pointer"
              >
                Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('status')}
                className="cursor-pointer"
              >
                Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('basicSalary')}
                className="cursor-pointer"
              >
                Basic Salary <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('grossSalary')}
                className="cursor-pointer"
              >
                Gross Salary <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!employees || employees.data === undefined ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : !employees.data || employees.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  No employees found
                </TableCell>
              </TableRow>
            ) : paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  No employees match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.empId}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.designationName ?? '-'}</TableCell>
                  <TableCell>{employee.departmentName ?? '-'}</TableCell>
                  <TableCell>{employee.companyName ?? '-'}</TableCell>
                  <TableCell>{employee.location ?? '-'}</TableCell>
                  <TableCell className="capitalize">
                    {employee.empCat}
                  </TableCell>
                  <TableCell className="capitalize">
                    {employee.empType}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        employee.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {employee.status ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {employee.basicSalary?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {employee.grossSalary?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(employee)}
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

      {sortedEmployees.length > 0 && (
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
        title={isEditMode ? 'Edit Employee' : 'Add Employee'}
        size="sm:max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empId">Employee ID*</Label>
                <Input
                  id="empId"
                  name="empId"
                  type="number"
                  value={formData.empId ?? ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designationId">Designation*</Label>
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
                    {designations?.data?.map((designation: any) => (
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
                <Label htmlFor="departmentId">Department*</Label>
                <Select
                  value={
                    formData.departmentId ? String(formData.departmentId) : ''
                  }
                  onValueChange={(value) =>
                    handleSelectChange('departmentId', value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.data?.map((department: any) => (
                      <SelectItem
                        key={department.departmentID}
                        value={String(department.departmentID)}
                      >
                        {department.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company*</Label>
                <Select
                  value={
                    formData.companyName ? String(formData.companyName) : ''
                  }
                  onValueChange={(value) =>
                    handleSelectChange('companyName', value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.data?.map((company: any) => (
                      <SelectItem
                        key={company.companyId}
                        value={String(company.companyName)}
                      >
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  name="location"
                  value={String(formData.location)}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empCat">Employee Category*</Label>
                <Select
                  value={formData.empCat || ''}
                  onValueChange={(value) => handleSelectChange('empCat', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="officer">Officer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="empType">Employee Type*</Label>
                <Select
                  value={formData.empType || ''}
                  onValueChange={(value) =>
                    handleSelectChange('empType', value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractual">Contractual</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeGroup">Employee Group*</Label>
                <Select
                  value={formData.employeeGroup || ''}
                  onValueChange={(value) =>
                    handleSelectChange('employeeGroup', value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="non-management">
                      Non-Management
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender*</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basicSalary">Basic Salary</Label>
                <Input
                  id="basicSalary"
                  name="basicSalary"
                  type="number"
                  step="0.01"
                  value={formData.basicSalary ?? ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grossSalary">Gross Salary</Label>
                <Input
                  id="grossSalary"
                  name="grossSalary"
                  type="number"
                  step="0.01"
                  value={formData.grossSalary ?? ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={
                    formData.dateOfBirth
                      ? format(new Date(formData.dateOfBirth), 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining</Label>
                <Input
                  id="dateOfJoining"
                  name="dateOfJoining"
                  type="date"
                  value={
                    formData.dateOfJoining
                      ? format(new Date(formData.dateOfJoining), 'yyyy-MM-dd')
                      : ''
                  }
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfConfirmation">Date of Confirmation</Label>
                <Input
                  id="dateOfConfirmation"
                  name="dateOfConfirmation"
                  type="date"
                  value={
                    formData.dateOfConfirmation
                      ? format(
                          new Date(formData.dateOfConfirmation),
                          'yyyy-MM-dd'
                        )
                      : ''
                  }
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  maxLength={15}
                  value={formData.mobileNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={formData.status ?? false}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

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

export default Employees
