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
  useGetTravelClaim,
  useAddTravelClaim,
  useApproveTravelClaim,
  useGetEmployee,
  useGetDesignations,
  useGetTravelAmounts,
  useGetEmployeesBySearch,
} from '@/hooks/use-api'
import type { CreateTravelClaimType, GetTravelClaimType } from '@/utils/type'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CustomCombobox } from '@/utils/custom-combobox'
import formatDate from '@/utils/formatDate'
import { Textarea } from '@/components/ui/textarea'
import { EmployeeDetails } from '../medical-claim/employeeDetails'
import { toast } from '@/hooks/use-toast'
import { getEmployeesBySearch } from '@/utils/api'
import {
  ComboboxItem,
  CustomComboboxWithApi,
} from '@/utils/custom-combobox-with-api'
import EmployeeClaimsGrid from '../medical-claim/employeeClaimGrid'

const TravelClaims = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const { data: travelClaims } = useGetTravelClaim()
  console.log('🚀 ~ TravelClaims ~ travelClaims:', travelClaims)
  // const { data: employees } = useGetEmployee()
  const { data: designations } = useGetDesignations()
  console.log('🚀 ~ TravelClaims ~ designations:', designations)

  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetTravelClaimType>('employeeName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: employees } = useGetEmployeesBySearch(search)
  console.log('🚀 ~ TravelClaims ~ employees:', employees)

  const [formData, setFormData] = useState<CreateTravelClaimType>({
    empId: 0,
    designationId: 0,
    travelCity: 'Dhaka',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    purpose: '',
    accomodationAmount: 0,
    dailyAllowance: 0,
    transport: '',
    remarks: '',
    isApproved: false,
    createdBy: userData?.userId || 0,
    updatedBy: null,
  })

  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const resetForm = () => {
    setFormData({
      empId: 0,
      designationId: 0,
      travelCity: 'Dhaka',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      purpose: '',
      accomodationAmount: 0,
      dailyAllowance: 0,
      transport: '',
      remarks: '',
      isApproved: false,
      createdBy: userData?.userId || 0,
      updatedBy: null,
    })
    setIsPopupOpen(false)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  const addMutation = useAddTravelClaim({
    onClose: closePopup,
    reset: resetForm,
  })

  const approveMutation = useApproveTravelClaim({
    onClose: () => {},
    reset: () => {},
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'travelCity') {
      setFormData((prev) => ({
        ...prev,
        [name]: value as
          | 'Dhaka'
          | 'Chittagong'
          | 'Sylhet'
          | "Cox'sbazar"
          | 'Others',
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
    addMutation.mutate({
      ...formData,
      createdBy: userData?.userId || 0,
    })
    console.log('🚀 ~ handleSubmit ~ formData:', formData)
  }

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id })
  }

  const handleSort = (column: keyof GetTravelClaimType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredClaims = useMemo(() => {
    if (!travelClaims?.data) return []
    return travelClaims.data.filter((travelClaim: GetTravelClaimType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        travelClaim.employeeName?.toLowerCase().includes(searchLower) ||
        travelClaim.designationName?.toLowerCase().includes(searchLower) ||
        travelClaim.travelCity?.toLowerCase().includes(searchLower) ||
        travelClaim.purpose?.toLowerCase().includes(searchLower) ||
        travelClaim.transport?.toLowerCase().includes(searchLower) ||
        travelClaim.remarks?.toLowerCase().includes(searchLower)
      )
    })
  }, [travelClaims?.data, searchTerm])

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

      if (
        sortColumn === 'fromDate' ||
        sortColumn === 'toDate' ||
        sortColumn === 'createdAt'
      ) {
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

  const { data: travelAmounts } = useGetTravelAmounts(
    formData.designationId as any,
    formData.travelCity as any,
    {
      enabled: !!formData.designationId && !!formData.travelCity, // only fetch when both selected
    }
  )

  useEffect(() => {
    if (travelAmounts?.error) {
      toast({
        title: 'Policy not found',
        description:
          'No travel policy available for this designation and city type.',
      })
    } else if (travelAmounts?.data) {
      setFormData((prev) => ({
        ...prev,
        accomodationAmount: travelAmounts.data?.accomodationAmount || 0,
        dailyAllowance: travelAmounts.data?.dailyAllowance || 0,
      }))
    }
  }, [travelAmounts])

  const items: ComboboxItem[] =
    employees?.data?.map((emp: any) => ({
      id: emp?.id !== undefined ? emp.id.toString() : '',
      name: `${emp.empId} - ${emp.name} - ${emp.designationName} - ${emp.departmentName}`,
    })) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Travel Claims</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search travel claims..."
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
                Employee Id <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
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
                onClick={() => handleSort('companyName')}
                className="cursor-pointer"
              >
                Company <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('travelCity')}
                className="cursor-pointer"
              >
                Travel City <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('fromDate')}
                className="cursor-pointer"
              >
                From Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('toDate')}
                className="cursor-pointer"
              >
                To Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('purpose')}
                className="cursor-pointer"
              >
                Purpose <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('accomodationAmount')}
                className="cursor-pointer"
              >
                Accommodation <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('dailyAllowance')}
                className="cursor-pointer"
              >
                Daily Allowance <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('transport')}
                className="cursor-pointer"
              >
                Transport <ArrowUpDown className="ml-2 h-4 w-4 inline" />
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
            {!travelClaims || travelClaims.data === undefined ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  Loading travel claims...
                </TableCell>
              </TableRow>
            ) : !travelClaims.data || travelClaims.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  No travel claims found
                </TableCell>
              </TableRow>
            ) : paginatedClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  No travel claims match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedClaims.map((travelClaim: GetTravelClaimType) => (
                <TableRow key={travelClaim.id}>
                  <TableCell>{travelClaim.empId}</TableCell>
                  <TableCell>{travelClaim.employeeName}</TableCell>
                  <TableCell>{travelClaim.designationName}</TableCell>
                  <TableCell>{travelClaim.departmentName}</TableCell>
                  <TableCell>{travelClaim.companyName}</TableCell>
                  <TableCell>{travelClaim.travelCity}</TableCell>
                  <TableCell>
                    {formatDate(travelClaim.fromDate as any)}
                  </TableCell>
                  <TableCell>{formatDate(travelClaim.toDate as any)}</TableCell>
                  <TableCell>{travelClaim.purpose ?? '-'}</TableCell>
                  <TableCell>{travelClaim.accomodationAmount ?? '-'}</TableCell>
                  <TableCell>{travelClaim.dailyAllowance ?? '-'}</TableCell>
                  <TableCell>{travelClaim.transport ?? '-'}</TableCell>
                  {/* <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        travelClaim.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {travelClaim.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {
                      <Button
                        variant="outline"
                        disabled={travelClaim.isApproved}
                        size="sm"
                        onClick={() =>
                          travelClaim.id && handleApprove(travelClaim.id)
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
        title="Add Travel Claim"
        size="sm:max-w-6xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empId">Employee</Label>
              {/* <CustomCombobox
                items={
                  employees?.data
                    ?.filter((employee: any) => employee.id !== undefined)
                    .map((employee: any) => ({
                      id: employee.id.toString(),
                      name:
                        `${employee.empId} - ${employee.name} - ${employee.designationName} - ${employee.departmentName}` ||
                        'Unnamed employee',
                    })) || []
                }
                value={
                  formData.empId
                    ? {
                        id: formData.empId.toString(),
                        name:
                          employees?.data?.find(
                            (e: any) => e.id === formData.empId
                          )?.name || '',
                      }
                    : null
                }
                onChange={(value) => {
                  const selectedEmp = employees?.data?.find(
                    (e: any) => e.id === Number(value?.id)
                  )
                  setFormData((prev) => ({
                    ...prev,
                    empId: value ? Number(value.id) : 0,
                    designationId: selectedEmp?.designationId || 0,
                  }))
                }}
                placeholder="Select employee"
              /> */}
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

            <div className="space-y-2">
              <Label htmlFor="travelCity">Travel City</Label>
              <Select
                value={formData.travelCity}
                onValueChange={(value) =>
                  handleSelectChange('travelCity', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dhaka">Dhaka</SelectItem>
                  <SelectItem value="Chittagong">Chittagong</SelectItem>
                  <SelectItem value="Sylhet">Sylhet</SelectItem>
                  <SelectItem value="Cox'sbazar">Cox&apos;s Bazar</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {employees?.data && (
            <EmployeeDetails
              empId={formData.empId as any}
              employees={employees.data}
            />
          )}
          {employees?.data && formData.empId && (
            <EmployeeClaimsGrid
              employeeId={formData.empId}
              claimType={'Travel'}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="transport">Transport</Label>
              <Input
                id="transport"
                name="transport"
                type="text"
                value={formData.transport || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                name="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                name="toDate"
                type="date"
                value={formData.toDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accomodationAmount">Accommodation Amount</Label>
              <Input
                id="accomodationAmount"
                name="accomodationAmount"
                type="number"
                value={formData.accomodationAmount || ''}
                onChange={handleInputChange}
                disabled={true}
                className="bg-gray-50"
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
                disabled={true}
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              name="purpose"
              value={formData.purpose || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks || ''}
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

export default TravelClaims
