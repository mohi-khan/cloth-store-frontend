import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAccountHead,
  createBankAccount,
  createCustomer,
  createExpense,
  createItem,
  createOpeningBalance,
  createPurchase,
  createSale,
  createSorting,
  createTransaction,
  createVendor,
  deleteSale,
  deleteSorting,
  editBankAccount,
  editCustomer,
  editSale,
  editSorting,
  editVendor,
  getAllAccountHeads,
  getAllBankAccounts,
  getAllCashInHand,
  getAllCustomerPaymentDetails,
  getAllCustomers,
  getAllExpenses,
  getAllInventoryItems,
  getAllItems,
  getAllOpeningBalances,
  getAllPurchases,
  getAllSales,
  getAllSortings,
  getAllTransaction,
  getAllVendors,
  getAvailableItem,
  getCashReport,
} from '@/utils/api'
import type {
  CreateAccountHeadType,
  CreateBankAccountType,
  CreateCustomerType,
  CreateExpenseType,
  CreateItemType,
  CreateOpeningBalanceType,
  CreatePurchaseType,
  CreateSalesType,
  CreateSortingType,
  CreateTransactionType,
  CreateVendorType,
  GetBankAccountType,
  GetCustomerType,
  GetSalesType,
  GetSortingType,
  GetVendorType,
} from '@/utils/type'
import { toast } from './use-toast'

//item
export const useGetItems = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['items'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllItems(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetAvailableItem = (id: number) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['availableItem', id], // ✅ include `id` here
    queryFn: () => {
      if (!token) throw new Error('Token not found')
      return getAvailableItem(id, token)
    },
    enabled: !!token && id > 0, // ✅ only run if token exists AND id > 0
    select: (data) => data,
  })
}

export const useAddItem = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateItemType) => {
      return createItem(data, token)
    },
    onSuccess: (data) => {
      console.log('item added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['items'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding item:', error)
    },
  })

  return mutation
}

//bank-account
export const useGetBankAccounts = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['bankAccounts'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllBankAccounts(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddBankAccount = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateBankAccountType) => {
      return createBankAccount(data, token)
    },
    onSuccess: (data) => {
      console.log('bank account added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding bank account:', error)
    },
  })

  return mutation
}

export const useEditBankAccount = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GetBankAccountType }) => {
      return editBankAccount(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Bank account edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing bank account:', error)
    },
  })

  return mutation
}

//vendor
export const useGetVendors = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllVendors(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddVendor = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateVendorType) => {
      return createVendor(data, token)
    },
    onSuccess: (data) => {
      console.log('vendor added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding vendor:', error)
    },
  })

  return mutation
}

export const useEditVendor = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GetVendorType }) => {
      return editVendor(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'vendor edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing vendor:', error)
    },
  })

  return mutation
}

export const useGetPurchases = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['purchases'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllPurchases(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddPurchase = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreatePurchaseType) => {
      return createPurchase(data, token)
    },
    onSuccess: (data) => {
      console.log('purchase added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding purchase:', error)
    },
  })

  return mutation
}

export const useGetSortings = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['sortings'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllSortings(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddSorting = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      purchaseId,
      data,
    }: {
      purchaseId: number
      data: CreateSortingType
    }) => {
      return createSorting(purchaseId, data, token)
    },
    onSuccess: (data) => {
      console.log('sorting added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['sortings'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding sorting:', error)
    },
  })

  return mutation
}

export const useEditSorting = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GetSortingType }) => {
      return editSorting(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'sorting edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['sortings'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing sorting:', error)
    },
  })

  return mutation
}

export const useDeleteSorting = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, userId }: { id: number, userId: number }) => {
      return deleteSorting(id, userId, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'sorted data deleted successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['sortings'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error deleting sorting:', error)
    },
  })

  return mutation
}


//customer
export const useGetCustomers = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllCustomers(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddCustomer = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateCustomerType) => {
      return createCustomer(data, token)
    },
    onSuccess: (data) => {
      console.log('customer added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['customers'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding customer:', error)
    },
  })

  return mutation
}

export const useEditCustomer = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GetCustomerType }) => {
      return editCustomer(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'customer edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['customers'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing customer:', error)
    },
  })

  return mutation
}

//sales
export const useGetSales = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['sales'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllSales(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddSale = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateSalesType) => {
      return createSale(data, token)
    },
    onSuccess: (data) => {
      console.log('sale added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['sales'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding sale:', error)
    },
  })

  return mutation
}

export const useEditSale = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GetSalesType }) => {
      return editSale(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'sale edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['sales'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing sale:', error)
    },
  })

  return mutation
}

export const useDeleteSale = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()

  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ saleMasterId, saleDetailsId, userId }: { saleMasterId: number, saleDetailsId: number, userId: number }) => {
      return deleteSale(saleMasterId, saleDetailsId, userId, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'sale is deleted successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['sales'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error deleting sale:', error)
    },
  })

  return mutation
}

//account-head
export const useGetAccountHeads = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['accountHeads'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllAccountHeads(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddAccountHead = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateAccountHeadType) => {
      return createAccountHead(data, token)
    },
    onSuccess: (data) => {
      console.log('account head added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['accountHeads'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding item:', error)
    },
  })

  return mutation
}

//expense
export const useGetExpenses = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllExpenses(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddExpense = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateExpenseType) => {
      return createExpense(data, token)
    },
    onSuccess: (data) => {
      console.log('expense added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding item:', error)
    },
  })

  return mutation
}

//dashboard
export const useGetInventoryItems = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['inventoryItems'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllInventoryItems(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetCustomerPaymentDetails = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['customerPaymentDetails'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllCustomerPaymentDetails(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetCashInHand = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['cashInHand'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllCashInHand(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

//transaction
export const useGetTransactions = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllTransaction(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddTransaction = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateTransactionType) => {
      return createTransaction(data, token)
    },
    onSuccess: (data) => {
      console.log('transaction added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding transaction:', error)
    },
  })

  return mutation
}

//opening-balance
export const useGetOpeningBalances = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['openingBalances'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllOpeningBalances(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddOpeningBalance = ({
  onClose,
  reset,
}: {
  onClose: () => void
  reset: () => void
}) => {
  useInitializeUser()
  const [token] = useAtom(tokenAtom)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateOpeningBalanceType) => {
      return createOpeningBalance(data, token)
    },
    onSuccess: (data) => {
      console.log('account head added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['openingBalances'] })
      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error adding item:', error)
    },
  })

  return mutation
}

//reports
export const useGetCashReport = (startDate: string, endDate: string) => {
  const [token] = useAtom(tokenAtom)

  return useQuery({
    queryKey: ['cashReport', startDate, endDate],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getCashReport(startDate, endDate, token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}