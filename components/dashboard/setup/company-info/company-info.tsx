'use client'

import type React from 'react'
import { useCallback, useState, useMemo } from 'react'
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
import { useEffect } from 'react'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useAddCompany, useGetCompanies } from '@/hooks/use-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GetCompanyType } from '@/utils/type'

const CompanyInfo = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GetCompanyType>('companyName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const router = useRouter()
  const { data: companies } = useGetCompanies()
  console.log('🚀 ~ CompanyInfo ~ companies:', companies?.data)

  const [error, setError] = useState<string | null>(null)

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

  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    logo: 'www.logo.com',
    parentCompanyId: null as number | null,
    active: true,
  })

  const resetForm = useCallback(() => {
    setFormData({
      companyName: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      logo: 'www.logo.com',
      parentCompanyId: null,
      active: true,
    })
  }, [])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number.parseInt(value) : null,
    }))
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddCompany({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSort = (column: keyof GetCompanyType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredCompanies = useMemo(() => {
    if (!companies?.data) return []
    return companies.data.filter((company: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        company.companyName?.toLowerCase().includes(searchLower) ||
        company.address?.toLowerCase().includes(searchLower) ||
        company.city?.toLowerCase().includes(searchLower) ||
        company.state?.toLowerCase().includes(searchLower) ||
        company.postalCode?.toLowerCase().includes(searchLower) ||
        company.email?.toLowerCase().includes(searchLower) ||
        company.phone?.toLowerCase().includes(searchLower)
      )
    })
  }, [companies?.data, searchTerm])

  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      if (sortColumn === 'active') {
        return sortDirection === 'asc'
          ? a.active === b.active
            ? 0
            : a.active
              ? -1
              : 1
          : a.active === b.active
            ? 0
            : a.active
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
  }, [filteredCompanies, sortColumn, sortDirection])

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedCompanies.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCompanies, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      mutation.mutate({
        ...formData,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Company Details</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
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
                onClick={() => handleSort('companyName')}
                className="cursor-pointer"
              >
                Company Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('address')}
                className="cursor-pointer"
              >
                Address <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('city')}
                className="cursor-pointer"
              >
                City <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('state')}
                className="cursor-pointer"
              >
                State <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('postalCode')}
                className="cursor-pointer"
              >
                Postal Code <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('active')}
                className="cursor-pointer"
              >
                Status <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!companies || companies.data === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading companies...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-red-500"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : !companies.data || companies?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No companies found
                </TableCell>
              </TableRow>
            ) : paginatedCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No companies match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedCompanies.map((company) => (
                <TableRow key={company.companyId}>
                  <TableCell>{company.companyName}</TableCell>
                  <TableCell>{company.address || '-'}</TableCell>
                  <TableCell>{company.city || '-'}</TableCell>
                  <TableCell>{company.state || '-'}</TableCell>
                  <TableCell>{company.postalCode || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        company.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {company.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedCompanies.length > 0 && (
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
        onClose={closePopup}
        title="Add Company"
        size="max-w-6xl h-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {(error || mutation.error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || 'Error adding company'}
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div
                className="border-2 border-dashed rounded-md p-6 flex items-center justify-center bg-gray-50 cursor-pointer"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <p className="text-gray-600">Drop your image here</p>
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept=".jpg,.jpeg,.gif,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFormData((prev) => ({
                        ...prev,
                        logo: e.target.files?.[0]?.name || '',
                      }))
                    }
                  }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Only (JPG, GIF, PNG) are allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentCompanyId">Parent Company</Label>
                <Select
                  value={
                    formData.parentCompanyId
                      ? String(formData.parentCompanyId)
                      : ''
                  }
                  onValueChange={(value) =>
                    handleSelectChange('parentCompanyId', value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent company" />
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
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    active: e.target.checked,
                  }))
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closePopup}>
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

export default CompanyInfo
