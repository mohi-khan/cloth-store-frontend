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
import { ArrowUpDown, Search, Landmark } from "lucide-react"
import { Popup } from "@/utils/popup"
import type { CreateAccountHeadType, GetAccountHeadType } from "@/utils/type"
import { tokenAtom, useInitializeUser, userDataAtom } from "@/utils/user"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"
import { formatDate } from '@/utils/conversions'
import { useAddAccountHead, useGetAccountHeads } from "@/hooks/use-api"

const AccountHeads = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)

  const { data: accountHeads } = useGetAccountHeads()

  const router = useRouter()

  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [accountHeadsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof GetAccountHeadType>("name")
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

  const [formData, setFormData] = useState<CreateAccountHeadType>({
    name: "",
    createdBy: userData?.userId || 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      createdBy: userData?.userId || 0,
    })
    setIsPopupOpen(false)
  }

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
    setError(null)
  }, [])

  const mutation = useAddAccountHead({
    onClose: closePopup,
    reset: resetForm,
  })

  const handleSort = (column: keyof GetAccountHeadType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredAccountHeads = useMemo(() => {
    if (!accountHeads?.data) return []
    return accountHeads.data.filter((head: any) => {
      const searchLower = searchTerm.toLowerCase()
      return head.name?.toLowerCase().includes(searchLower)
    })
  }, [accountHeads?.data, searchTerm])

  const sortedAccountHeads = useMemo(() => {
    return [...filteredAccountHeads].sort((a, b) => {
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
  }, [filteredAccountHeads, sortColumn, sortDirection])

  const paginatedAccountHeads = useMemo(() => {
    const startIndex = (currentPage - 1) * accountHeadsPerPage
    return sortedAccountHeads.slice(startIndex, startIndex + accountHeadsPerPage)
  }, [sortedAccountHeads, currentPage, accountHeadsPerPage])

  const totalPages = Math.ceil(sortedAccountHeads.length / accountHeadsPerPage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      mutation.mutate(formData)
    } catch (err) {
      setError("Failed to create account head")
      console.error(err)
    }
  }

  useEffect(() => {
    if (mutation.error) {
      setError("Error adding account head")
    }
  }, [mutation.error])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Landmark className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Account Heads</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search account heads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black" onClick={() => setIsPopupOpen(true)}>
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Account Head Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                Created At <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort("updatedAt")} className="cursor-pointer">
                Updated At <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!accountHeads || accountHeads.data === undefined ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading account heads...
                </TableCell>
              </TableRow>
            ) : !accountHeads.data || accountHeads.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No account heads found
                </TableCell>
              </TableRow>
            ) : paginatedAccountHeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No account heads match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedAccountHeads.map((head) => (
                <TableRow key={head.accountHeadId}>
                  <TableCell>{head.name}</TableCell>
                  <TableCell>{formatDate(head.createdAt)}</TableCell>
                  <TableCell>{formatDate(head.updatedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedAccountHeads.length > 0 && (
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

      <Popup isOpen={isPopupOpen} onClose={resetForm} title="Add Account Head" size="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Head Name*</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default AccountHeads
