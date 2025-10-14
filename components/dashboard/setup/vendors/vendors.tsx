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
import { useGetVendors, useAddVendor, useEditVendor } from "@/hooks/use-api"
import formatDate from "@/utils/formatDate"
import type { CreateVendorType, GetVendorType } from "@/utils/type"

const Vendors = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: vendors } = useGetVendors()

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GetVendorType>("name")
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
  const [editingVendor, setEditingVendor] = useState<GetVendorType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateVendorType>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    createdBy: userData?.userId || 0,
  })

  const handleSort = (column: keyof GetVendorType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredVendors = useMemo(() => {
    if (!vendors?.data) return []
    return vendors.data.filter((vendor: any) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        vendor.name?.toLowerCase().includes(searchLower) ||
        vendor.contactPerson?.toLowerCase().includes(searchLower) ||
        vendor.phone?.toLowerCase().includes(searchLower) ||
        vendor.email?.toLowerCase().includes(searchLower) ||
        vendor.address?.toLowerCase().includes(searchLower)
      )
    })
  }, [vendors?.data, searchTerm])

  const sortedVendors = useMemo(() => {
    return [...filteredVendors].sort((a, b) => {
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
  }, [filteredVendors, sortColumn, sortDirection])

  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedVendors.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedVendors, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedVendors.length / itemsPerPage)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEdit = (vendor: GetVendorType) => {
    setIsEditMode(true)
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      contactPerson: vendor.contactPerson || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      address: vendor.address || "",
      createdBy: userData?.userId || 0,
      updatedBy: userData?.userId || 0,
    })
    setIsPopupOpen(true)
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setEditingVendor(null)
    resetForm()
    setIsPopupOpen(true)
  }

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
    setIsEditMode(false)
    setEditingVendor(null)
  }, [userData?.userId, setIsPopupOpen, setIsEditMode, setEditingVendor])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const addMutation = useAddVendor({
    onClose: closePopup,
    reset: resetForm,
  })

  const editMutation = useEditVendor({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      try {
        if (isEditMode && editingVendor) {
          if (editingVendor?.vendorId === undefined || editingVendor?.createdBy === undefined) return

          editMutation.mutate({
            id: editingVendor.vendorId,
            data: {
              ...formData,
              vendorId: editingVendor.vendorId,
              updatedBy: userData?.userId || 0,
              createdBy: editingVendor.createdBy || 0,
              name: formData.name,
              contactPerson: formData.contactPerson || null,
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
        setError(`Failed to ${isEditMode ? "update" : "create"} vendor`)
        console.error(`Error ${isEditMode ? "updating" : "creating"} vendor:`, error)
      }
    },
    [formData, userData, isEditMode, editingVendor, addMutation, editMutation, resetForm],
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Users className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Vendors</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search vendors..."
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
                Vendor Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("contactPerson")} className="cursor-pointer">
                Contact Person <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("phone")} className="cursor-pointer">
                Phone <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
                Email <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                Created At <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!vendors || vendors.data === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading vendors...
                </TableCell>
              </TableRow>
            ) : !vendors.data || vendors.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No vendors found
                </TableCell>
              </TableRow>
            ) : paginatedVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No vendors match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedVendors.map((vendor) => (
                <TableRow key={vendor.vendorId}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.contactPerson}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(vendor)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedVendors.length > 0 && (
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
        title={isEditMode ? "Edit Vendor" : "Add Vendor"}
        size="sm:max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter vendor name"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson || ""}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
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

export default Vendors
