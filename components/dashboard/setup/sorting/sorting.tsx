'use client'

import type React from 'react'
import { useCallback, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ArrowUpDown, Search, Package, Plus, Trash2 } from 'lucide-react'
import { Popup } from '@/utils/popup'
import type { GetSortingType, GetPurchaseType } from '@/utils/type'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import formatDate from '@/utils/formatDate'
import {
  useGetPurchases,
  useGetItems,
  useGetVendors,
  useGetBankAccounts,
  useGetSortings,
  useAddSorting,
  useEditSorting,
} from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { useToast } from '@/hooks/use-toast'

interface SortingItem {
  sortingId?: number
  itemId: number
  quantity: number
  notes: string
  totalAmount: number
}

const Sortings = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const { toast } = useToast()

  const { data: sortings } = useGetSortings()
  const { data: purchases } = useGetPurchases()
  const { data: items } = useGetItems()
  const { data: vendors } = useGetVendors()
  const { data: bankAccounts } = useGetBankAccounts()

  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] =
    useState<keyof GetSortingType>('sortingDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const [purchaseSortColumn, setPurchaseSortColumn] =
    useState<keyof GetPurchaseType>('purchaseDate')
  const [purchaseSortDirection, setPurchaseSortDirection] = useState<
    'asc' | 'desc'
  >('desc')

  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] =
    useState<GetPurchaseType | null>(null)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(
    null
  )

  // For sorting popup - multiple items
  const [sortingItems, setSortingItems] = useState<SortingItem[]>([
    { itemId: 0, quantity: 0, notes: '', totalAmount: 0 },
  ])

  const [editSortingItems, setEditSortingItems] = useState<SortingItem[]>([
    { itemId: 0, quantity: 0, notes: '', totalAmount: 0 },
  ])

  const handleSort = (column: keyof GetSortingType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handlePurchaseSort = (column: keyof GetPurchaseType) => {
    if (column === purchaseSortColumn) {
      setPurchaseSortDirection(purchaseSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setPurchaseSortColumn(column)
      setPurchaseSortDirection('asc')
    }
  }

  const filteredSortings = useMemo(() => {
    if (!sortings?.data) return []
    return sortings.data.filter((sorting: GetSortingType) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        sorting.itemName?.toLowerCase().includes(searchLower) ||
        sorting.vendorName?.toLowerCase().includes(searchLower) ||
        sorting.totalAmount?.toString().includes(searchLower) ||
        sorting.paymentType?.toLowerCase().includes(searchLower)
      )
    })
  }, [sortings?.data, searchTerm])

  const sortedSortings = useMemo(() => {
    return [...filteredSortings].sort((a, b) => {
      const aValue = a[sortColumn] ?? ''
      const bValue = b[sortColumn] ?? ''

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
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
  }, [filteredSortings, sortColumn, sortDirection])

  const groupedSortings = useMemo(() => {
    const groups = new Map<number, GetSortingType[]>()
    sortedSortings.forEach((sorting) => {
      const purchaseId = sorting.purchaseId
      if (!groups.has(purchaseId)) {
        groups.set(purchaseId, [])
      }
      groups.get(purchaseId)!.push(sorting)
    })
    return groups
  }, [sortedSortings])

  const flattenedGroupedSortings = useMemo(() => {
    const result: Array<{
      type: 'group'
      purchaseId: number
      sortings: GetSortingType[]
    }> = []
    groupedSortings.forEach((sortings, purchaseId) => {
      result.push({ type: 'group', purchaseId, sortings })
    })
    return result
  }, [groupedSortings])

  const paginatedSortings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return flattenedGroupedSortings.slice(startIndex, startIndex + itemsPerPage)
  }, [flattenedGroupedSortings, currentPage, itemsPerPage])

  const totalPages = Math.ceil(flattenedGroupedSortings.length / itemsPerPage)

  const sortedPurchases = useMemo(() => {
    if (!purchases?.data) return []
    return [...purchases.data]
      .filter((purchase: GetPurchaseType) => purchase.isSorted === false)
      .sort((a, b) => {
        const aValue = a[purchaseSortColumn] ?? ''
        const bValue = b[purchaseSortColumn] ?? ''

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return purchaseSortDirection === 'asc'
            ? aValue - bValue
            : bValue - aValue
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return purchaseSortDirection === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime()
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return purchaseSortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        if (aValue < bValue) return purchaseSortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return purchaseSortDirection === 'asc' ? 1 : -1
        return 0
      })
  }, [purchases?.data, purchaseSortColumn, purchaseSortDirection])

  // Handle opening sort popup
  const handleOpenSortPopup = (purchase: GetPurchaseType) => {
    setSelectedPurchase(purchase)
    setSortingItems([{ itemId: 0, quantity: 0, notes: '', totalAmount: 0 }])
    setIsSortPopupOpen(true)
  }

  const handleOpenEditPopup = (purchaseId: number) => {
    const sortingsForPurchase = groupedSortings.get(purchaseId) || []
    const purchase = purchases?.data?.find(
      (p: GetPurchaseType) => p.purchaseId === purchaseId
    )

    if (!purchase) {
      toast({
        title: 'Error',
        description: 'Purchase not found',
        variant: 'destructive',
      })
      return
    }

    setSelectedPurchaseId(purchaseId)
    setSelectedPurchase(purchase)

    // Map existing sortings to edit items
    const editItems: SortingItem[] = sortingsForPurchase.map((sorting) => ({
      sortingId: sorting.sortingId,
      itemId: sorting.itemId,
      quantity: sorting.totalQuantity,
      notes: sorting.notes || '',
      totalAmount: sorting.totalAmount,
    }))

    setEditSortingItems(editItems)
    setIsEditPopupOpen(true)
  }

  // Add more sorting items
  const handleAddSortingItem = () => {
    setSortingItems([
      ...sortingItems,
      { itemId: 0, quantity: 0, notes: '', totalAmount: 0 },
    ])
  }

  const handleAddEditSortingItem = () => {
    setEditSortingItems([
      ...editSortingItems,
      { itemId: 0, quantity: 0, notes: '', totalAmount: 0 },
    ])
  }

  // Remove sorting item
  const handleRemoveSortingItem = (index: number) => {
    if (sortingItems.length > 1) {
      setSortingItems(sortingItems.filter((_, i) => i !== index))
    }
  }

  const handleRemoveEditSortingItem = (index: number) => {
    if (editSortingItems.length > 1) {
      setEditSortingItems(editSortingItems.filter((_, i) => i !== index))
    }
  }

  // Update sorting item
  const handleUpdateSortingItem = (
    index: number,
    field: keyof SortingItem,
    value: number | string
  ) => {
    const updated = [...sortingItems]
    if (field === 'itemId' || field === 'quantity' || field === 'totalAmount') {
      updated[index][field] = Number(value)
    } else if (field === 'notes') {
      updated[index][field] = String(value)
    }
    setSortingItems(updated)
  }

  const handleUpdateEditSortingItem = (
    index: number,
    field: keyof SortingItem,
    value: number | string
  ) => {
    const updated = [...editSortingItems]
    if (field === 'itemId' || field === 'quantity' || field === 'totalAmount') {
      updated[index][field] = Number(value)
    } else if (field === 'notes') {
      updated[index][field] = String(value)
    }
    setEditSortingItems(updated)
  }

  const resetSortForm = () => {
    setSortingItems([{ itemId: 0, quantity: 0, notes: '', totalAmount: 0 }])
    setSelectedPurchase(null)
    setIsSortPopupOpen(false)
    setError(null)
  }

  const resetEditForm = () => {
    setEditSortingItems([{ itemId: 0, quantity: 0, notes: '', totalAmount: 0 }])
    setSelectedPurchase(null)
    setSelectedPurchaseId(null)
    setIsEditPopupOpen(false)
    setError(null)
  }

  const closeSortPopup = useCallback(() => {
    setIsSortPopupOpen(false)
    setError(null)
  }, [])

  const closeEditPopup = useCallback(() => {
    setIsEditPopupOpen(false)
    setError(null)
  }, [])

  const sortMutation = useAddSorting({
    onClose: closeSortPopup,
    reset: resetSortForm,
  })
  const editMutation = useEditSorting({
    onClose: closeEditPopup,
    reset: resetEditForm,
  })

  // Handle sort submission
  const handleSortSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedPurchase) {
      setError('No purchase selected')
      return
    }

    // Validate all items are selected
    const hasEmptyItems = sortingItems.some((item) => item.itemId === 0)
    if (hasEmptyItems) {
      toast({
        title: 'Error',
        description: 'Please select an item for all rows',
        variant: 'destructive',
      })
      return
    }

    // Calculate total quantity
    const totalQuantity = sortingItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    // Validate total quantity matches purchase quantity
    if (totalQuantity !== selectedPurchase.totalQuantity) {
      toast({
        title: 'Quantity Mismatch',
        description: `Total quantity (${totalQuantity}) must match purchase quantity (${selectedPurchase.totalQuantity})`,
        variant: 'destructive',
      })
      return
    }

    try {
      const sortingDataArray = sortingItems.map((item) => ({
        itemId: item.itemId,
        totalQuantity: item.quantity,
        vendorId: selectedPurchase.vendorId,
        paymentType: selectedPurchase.paymentType as
          | 'cash'
          | 'credit'
          | 'bank'
          | 'mfs',
        sortingDate: new Date(),
        totalAmount: item.totalAmount,
        createdBy: userData?.userId || 0,
        notes:
          item.notes || `Sorted from purchase #${selectedPurchase.purchaseId}`,
        bankAccountId: selectedPurchase.bankAccountId,
        purchaseId: selectedPurchase.purchaseId,
        createdAt: new Date(),
        updatedBy: userData?.userId || 0,
        updatedAt: new Date(),
      }))

      await sortMutation.mutateAsync({
        purchaseId: selectedPurchase.purchaseId!,
        data: sortingDataArray as any,
      })

      toast({
        title: 'Success',
        description: 'Sorting completed successfully',
      })
      resetSortForm()
    } catch (err) {
      setError('Failed to create sorting')
      console.error(err)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedPurchase || !selectedPurchaseId) {
      setError('No purchase selected')
      return
    }

    // Validate all items are selected
    const hasEmptyItems = editSortingItems.some((item) => item.itemId === 0)
    if (hasEmptyItems) {
      toast({
        title: 'Error',
        description: 'Please select an item for all rows',
        variant: 'destructive',
      })
      return
    }

    // Calculate total quantity
    const totalQuantity = editSortingItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    // Validate total quantity matches purchase quantity
    if (totalQuantity !== selectedPurchase.totalQuantity) {
      toast({
        title: 'Quantity Mismatch',
        description: `Total quantity (${totalQuantity}) must match purchase quantity (${selectedPurchase.totalQuantity})`,
        variant: 'destructive',
      })
      return
    }

    try {
      // Get existing sortings for this purchase
      const existingSortings = groupedSortings.get(selectedPurchaseId) || []

      // Prepare update data - match by sortingId if exists, otherwise create new
      const updatePromises = editSortingItems.map((item, index) => {
        const existingSorting = existingSortings[index]

        const sortingData = {
          itemId: item.itemId,
          totalQuantity: item.quantity,
          vendorId: selectedPurchase.vendorId,
          paymentType: selectedPurchase.paymentType as
            | 'cash'
            | 'credit'
            | 'bank'
            | 'mfs',
          sortingDate: existingSorting?.sortingDate || new Date(),
          totalAmount: item.totalAmount,
          notes: item.notes || `Sorted from purchase #${selectedPurchaseId}`,
          bankAccountId: selectedPurchase.bankAccountId,
          purchaseId: selectedPurchaseId,
          updatedBy: userData?.userId || 0,
          updatedAt: new Date(),
        }

        if (item.sortingId && existingSorting) {
          // Update existing sorting
          return editMutation.mutateAsync({
            id: item.sortingId,
            data: sortingData as any,
          })
        }
      })

      await Promise.all(updatePromises.filter(Boolean))

      toast({
        title: 'Success',
        description: 'Sortings updated successfully',
      })
      resetEditForm()
    } catch (err) {
      setError('Failed to update sortings')
      console.error(err)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-amber-100 p-2 rounded-md">
            <Package className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold">Sortings</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sortings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Purchases Table with Sort Actions */}
      <div className="rounded-md border mb-8">
        <div className="p-4 bg-amber-50 border-b">
          <h3 className="font-semibold text-amber-900">
            Purchases Available for Sorting
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handlePurchaseSort('itemName')}
                className="cursor-pointer"
              >
                Item Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handlePurchaseSort('vendorName')}
                className="cursor-pointer"
              >
                Vendor <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handlePurchaseSort('totalQuantity')}
                className="cursor-pointer"
              >
                Quantity <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handlePurchaseSort('totalAmount')}
                className="cursor-pointer"
              >
                Total Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handlePurchaseSort('purchaseDate')}
                className="cursor-pointer"
              >
                Purchase Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!purchases?.data ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading purchases...
                </TableCell>
              </TableRow>
            ) : sortedPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No purchases found
                </TableCell>
              </TableRow>
            ) : (
              sortedPurchases.map((purchase: GetPurchaseType) => (
                <TableRow key={purchase.purchaseId}>
                  <TableCell>{purchase.itemName}</TableCell>
                  <TableCell>{purchase.vendorName}</TableCell>
                  <TableCell>{purchase.totalQuantity}</TableCell>
                  <TableCell>{purchase.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenSortPopup(purchase)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700"
                      >
                        Sort
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sortings Table */}
      <div className="rounded-md border">
        <div className="p-4 bg-amber-50 border-b">
          <h3 className="font-semibold text-amber-900">Completed Sortings</h3>
        </div>
        <Table>
          <TableHeader className="bg-amber-100">
            <TableRow>
              <TableHead
                onClick={() => handleSort('itemName')}
                className="cursor-pointer"
              >
                Item Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('vendorName')}
                className="cursor-pointer"
              >
                Vendor <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('totalQuantity')}
                className="cursor-pointer"
              >
                Quantity <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('totalAmount')}
                className="cursor-pointer"
              >
                Total Amount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('paymentType')}
                className="cursor-pointer"
              >
                Payment Type <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('sortingDate')}
                className="cursor-pointer"
              >
                Sorting Date <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('bankName')}
                className="cursor-pointer"
              >
                Bank Details <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead
                onClick={() => handleSort('notes')}
                className="cursor-pointer"
              >
                Notes <ArrowUpDown className="ml-2 h-4 w-4 inline" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!sortings?.data ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  Loading sortings...
                </TableCell>
              </TableRow>
            ) : sortings.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No sortings found
                </TableCell>
              </TableRow>
            ) : paginatedSortings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No sortings match your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedSortings.map((group) => {
                const { purchaseId, sortings } = group
                return sortings.map((sorting, index) => (
                  <TableRow key={sorting.sortingId}>
                    <TableCell>{sorting.itemName}</TableCell>
                    <TableCell>{sorting.vendorName}</TableCell>
                    <TableCell>{sorting.totalQuantity}</TableCell>
                    <TableCell>{sorting.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">
                      {sorting.paymentType}
                    </TableCell>
                    <TableCell>{formatDate(sorting.sortingDate)}</TableCell>
                    <TableCell>
                      {sorting.bankName
                        ? `${sorting.bankName} - ${sorting.branch} - ${sorting.accountNumber}`
                        : '-'}
                    </TableCell>
                    <TableCell>{sorting.notes || '-'}</TableCell>
                    <TableCell>
                      {/* Show edit button only on first row of each group */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditPopup(purchaseId)}
                        >
                          Edit
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {flattenedGroupedSortings.length > 0 && (
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

      {/* Sort Popup */}
      <Popup
        isOpen={isSortPopupOpen}
        onClose={resetSortForm}
        title={`Sort Purchase: ${selectedPurchase?.itemName || ''}`}
        size="sm:max-w-5xl"
      >
        <form onSubmit={handleSortSubmit} className="space-y-4 py-4">
          <div className="bg-amber-50 p-3 rounded-md mb-4">
            <p className="text-sm text-amber-900">
              <strong>Purchase Quantity:</strong>{' '}
              {selectedPurchase?.totalQuantity || 0}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              The sum of all item quantities must equal the purchase quantity.
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow>
                  <TableHead className="w-1/4">Item</TableHead>
                  <TableHead className="w-1/6">Quantity</TableHead>
                  <TableHead className="w-1/4">Notes</TableHead>
                  <TableHead className="w-1/6">Total Amount</TableHead>
                  <TableHead className="w-1/12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortingItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <CustomCombobox
                        items={
                          items?.data?.map((i) => ({
                            id: i?.itemId?.toString() || '0',
                            name: i.itemName || 'Unnamed item',
                          })) || []
                        }
                        value={
                          item.itemId > 0
                            ? {
                                id: item.itemId.toString(),
                                name:
                                  items?.data?.find(
                                    (i) => i.itemId === item.itemId
                                  )?.itemName || '',
                              }
                            : null
                        }
                        onChange={(value) =>
                          handleUpdateSortingItem(
                            index,
                            'itemId',
                            value ? Number(value.id) : 0
                          )
                        }
                        placeholder="Select item"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          handleUpdateSortingItem(
                            index,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        placeholder="Enter quantity"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={item.notes}
                        onChange={(e) =>
                          handleUpdateSortingItem(
                            index,
                            'notes',
                            e.target.value
                          )
                        }
                        placeholder="Enter notes (optional)"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.totalAmount || ''}
                        onChange={(e) =>
                          handleUpdateSortingItem(
                            index,
                            'totalAmount',
                            Number(e.target.value)
                          )
                        }
                        placeholder="Enter amount"
                      />
                    </TableCell>
                    <TableCell>
                      {sortingItems.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSortingItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddSortingItem}
            className="w-full bg-transparent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More
          </Button>

          <div className="bg-amber-50 p-3 rounded-md">
            <p className="text-sm text-amber-900">
              <strong>Total Quantity:</strong>{' '}
              {sortingItems.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              )}
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetSortForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={sortMutation.isPending}>
              {sortMutation.isPending ? 'Sorting...' : 'Complete Sort'}
            </Button>
          </div>
        </form>
      </Popup>

      <Popup
        isOpen={isEditPopupOpen}
        onClose={resetEditForm}
        title={`Edit Sortings: ${selectedPurchase?.itemName || ''} (Purchase #${selectedPurchaseId})`}
        size="sm:max-w-5xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
          <div className="bg-amber-50 p-3 rounded-md mb-4">
            <p className="text-sm text-amber-900">
              <strong>Purchase Quantity:</strong>{' '}
              {selectedPurchase?.totalQuantity || 0}
            </p>
            <p className="text-sm text-amber-700 mt-1">
              The sum of all item quantities must equal the purchase quantity.
            </p>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow>
                  <TableHead className="w-1/4">Item</TableHead>
                  <TableHead className="w-1/6">Quantity</TableHead>
                  <TableHead className="w-1/4">Notes</TableHead>
                  <TableHead className="w-1/6">Total Amount</TableHead>
                  <TableHead className="w-1/12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editSortingItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <CustomCombobox
                        items={
                          items?.data?.map((i) => ({
                            id: i?.itemId?.toString() || '0',
                            name: i.itemName || 'Unnamed item',
                          })) || []
                        }
                        value={
                          item.itemId > 0
                            ? {
                                id: item.itemId.toString(),
                                name:
                                  items?.data?.find(
                                    (i) => i.itemId === item.itemId
                                  )?.itemName || '',
                              }
                            : null
                        }
                        onChange={(value) =>
                          handleUpdateEditSortingItem(
                            index,
                            'itemId',
                            value ? Number(value.id) : 0
                          )
                        }
                        placeholder="Select item"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          handleUpdateEditSortingItem(
                            index,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        placeholder="Enter quantity"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={item.notes}
                        onChange={(e) =>
                          handleUpdateEditSortingItem(
                            index,
                            'notes',
                            e.target.value
                          )
                        }
                        placeholder="Enter notes (optional)"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.totalAmount || ''}
                        onChange={(e) =>
                          handleUpdateEditSortingItem(
                            index,
                            'totalAmount',
                            Number(e.target.value)
                          )
                        }
                        placeholder="Enter amount"
                      />
                    </TableCell>
                    <TableCell>
                      {editSortingItems.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveEditSortingItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddEditSortingItem}
            className="w-full bg-transparent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More
          </Button>

          <div className="bg-amber-50 p-3 rounded-md">
            <p className="text-sm text-amber-900">
              <strong>Total Quantity:</strong>{' '}
              {editSortingItems.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              )}
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetEditForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Popup>
    </div>
  )
}

export default Sortings
