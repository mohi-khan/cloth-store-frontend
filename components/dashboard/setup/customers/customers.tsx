"use client"

import type React from "react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ArrowUpDown, Search, Users } from "lucide-react"
import { Popup } from "@/utils/popup"
import { tokenAtom, useInitializeUser, userDataAtom } from "@/utils/user"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"
import { useGetCustomers, useAddCustomer, useEditCustomer } from "@/hooks/use-api"
import formatDate from "@/utils/formatDate"
import type { CreateCustomerType, GetCustomerType } from "@/utils/type"

const Customers = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: customers } = useGetCustomers()

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GetCustomerType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem("currentUser")
      const storedToken = localStorage.getItem("authToken")
      if (!storedUserData || !storedToken) {
        console.log("No user data or token found in localStorage")
        router.push("/")
        return
      }
    }
    checkUserData()
  }, [userData, token, router])

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<GetCustomerType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateCustomerType>({
    name: "",
    phone: "",
    email: "",
    address: "",
    createdBy: userData?.userId || 0,
  })

  const handleSort = (column: keyof GetCustomerType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredCustomers = useMemo(() => {
    if (!customers?.data) return []
    return customers.data.filter((customer: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.address?.toLowerCase().includes(searchLower)
      )
    })
  }, [customers?.data, searchTerm])

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const aValue = a[sortColumn] ?? ""
      const bValue = b[sortColumn] ?? ""

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredCustomers, sortColumn, sortDirection])

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedCustomers.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCustomers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEdit = (customer: GetCustomerType) => {
    setIsEditMode(true)
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      createdBy: userData?.userId || 0,
      updatedBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setEditingCustomer(null)
    resetForm()
    setIsPopupOpen(true)
  }

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setIsEditMode(false)
    setEditingCustomer(null)
  }, [userData?.userId, setIsPopupOpen, setIsEditMode, setEditingCustomer])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const addMutation = useAddCustomer({
    onClose: closePopup,
    reset: resetForm,
  })

  const editMutation = useEditCustomer({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      try {
        if (isEditMode && editingCustomer) {
          if (editingCustomer?.customerId === undefined || editingCustomer?.createdBy === undefined) return

          editMutation.mutate({
            id: editingCustomer.customerId,
            data: {
              ...formData,
              customerId: editingCustomer.customerId,
              updatedBy: userData?.userId || 0,
              createdBy: editingCustomer.createdBy || 0,
              name: formData.name,
              phone: formData.phone || null,
              email: formData.email || null,
              address: formData.address || null,
            },
          })
        } else {
          addMutation.mutate({
            ...formData,
            createdBy: userData?.userId || 0,
          })
        }
        resetForm()
      } catch (error) {
        setError(`Failed to ${isEditMode ? "update" : "create"} customer`)
        console.error(`Error ${isEditMode ? "updating" : "creating"} customer:`, error)
      }
    },
    [formData, userData, isEditMode, editingCustomer, addMutation, editMutation, resetForm],
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Users className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Customers</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black" onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Customer Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("phone")} className="cursor-pointer">
                Phone <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                Email <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("address")} className="cursor-pointer">
                Address <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                Created At <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!customers || customers.data === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : !customers.data || customers.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No customers found
                </TableCell>
              </TableRow>
            ) : paginatedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No customers match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedCustomers.map((customer) => (
                <TableRow key={customer.customerId}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedCustomers.length > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => {
                if (index === 0 || index === totalPages - 1 || (index >= currentPage - 2 && index <= currentPage + 2)) {
                  return (
                    <PaginationItem key={`page-${index}`}>
                      <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (index === currentPage - 3 || index === currentPage + 3) {
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Popup
        isOpen={isPopupOpen}
        onClose={resetForm}
        title={isEditMode ? "Edit Customer" : "Add Customer"}
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="Enter email address"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder="Enter address"
                maxLength={255}
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? "Update" : "Save"}</Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default Customers
