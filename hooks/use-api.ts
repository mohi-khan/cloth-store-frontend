import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveClaim,
  approveTravelClaim,
  createBankAccount,
  createClaim,
  createDesignation,
  createEmployee,
  createItem,
  createMobileAllowancePolicy,
  createPurchase,
  createReimbursementPolicies,
  createSorting,
  createTaPolicy,
  createTravelClaim,
  createVendor,
  editBankAccount,
  editClaim,
  EditClaimTypeBalance,
  editDesignation,
  editEmployee,
  editMobileAllowancePolicy,
  editReimbursementPolicies,
  editSorting,
  editTaPolicy,
  editVendor,
  getAllBankAccounts,
  getAllClaims,
  getAllClaimTypeBalances,
  getAllDesignations,
  getAllEmployees,
  getAllItems,
  getAllMobileAllowancePolicies,
  getAllPurchases,
  getAllReimbursementPolicies,
  getAllSortings,
  getAllTaPolicies,
  getAllTravelClaims,
  getAllVendors,
  getBirthdayReport,
  getClaimBalance,
  getCurrentMonthClaimsCount,
  getCurrentMonthTotalClaimAmount,
  getEmployeeClaims,
  getEmployeeClaimsReport,
  getEmployeeSalaryHistory,
  getEmployeesBySearch,
  getIsNewClaimPossible,
  getTravelAmounts,
} from '@/utils/api'
import type {
  CreateBankAccountType,
  CreateItemType,
  CreatePurchaseType,
  CreateSortingType,
  CreateVendorType,
  GetBankAccountType,
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
    mutationFn: ({ purchaseId, data }: { purchaseId: number; data: CreateSortingType }) => {
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







//ta policy levels
export const useGetTaPolicyLevels = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['taPolicyLevels'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllTaPolicies(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddTaPolicyLevel = ({
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
    mutationFn: (data: CreateTaPolicyType) => {
      return createTaPolicy(data, token)
    },
    onSuccess: (data) => {
      console.log('ta policy level added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['taPolicyLevels'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding designation:', error)
    },
  })

  return mutation
}

export const useEditTaPolicyLevel = ({
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
    mutationFn: ({ id, data }: { id: number; data: GetTaPolicyType }) => {
      return editTaPolicy(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'TA Policy Level information edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['taPolicyLevels'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing TA Policy Level:', error)
    },
  })

  return mutation
}

//re imbursement policy
export const useGetReimbursementPolicy = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['reimbursementPolicies'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllReimbursementPolicies(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddReimbursementPolicy = ({
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
    mutationFn: (data: CreateReimbursementPolicyType) => {
      return createReimbursementPolicies(data, token)
    },
    onSuccess: (data) => {
      console.log('Reimbursement policy added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['reimbursementPolicies'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding designation:', error)
    },
  })

  return mutation
}

export const useEditReimbursementPolicy = ({
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
      id,
      data,
    }: {
      id: number
      data: GetReimbursementPolicyType
    }) => {
      return editReimbursementPolicies(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Reimbursement Policy information edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['reimbursementPolicies'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing TA Policy Level:', error)
    },
  })

  return mutation
}

//mobile allowance policy
export const useGetMobileAllowancePolicy = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['mobileAllowancePolicies'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllMobileAllowancePolicies(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddMobileAllowancePolicy = ({
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
    mutationFn: (data: CreateMobileAllowancePolicyType) => {
      return createMobileAllowancePolicy(data, token)
    },
    onSuccess: (data) => {
      console.log('Mobile allowance policy added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['mobileAllowancePolicies'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding designation:', error)
    },
  })

  return mutation
}

export const useEditMobileAllowancePolicy = ({
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
      id,
      data,
    }: {
      id: number
      data: GetMobileAllowancePolicyType
    }) => {
      return editMobileAllowancePolicy(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Mobile Allowance Policy information edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['mobileAllowancePolicies'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing Mobile Allowance Policy:', error)
    },
  })

  return mutation
}

//employee
export const useGetEmployee = () => {
  const [token] = useAtom(tokenAtom)

  return useQuery({
    queryKey: ['employees'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllEmployees(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetEmployeesBySearch = (search: string) => {
  const [token] = useAtom(tokenAtom)

  return useQuery({
    queryKey: ['employees', search], // ✅ include search in key
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getEmployeesBySearch(search, token)
    },
    enabled: !!token && search.length > 0,
    select: (data) => data,
  })
}

export const useAddEmployee = ({
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
    mutationFn: (data: CreateEmployeeType) => {
      console.log('🚀 ~ useAddEmployee ~ data:', data)
      return createEmployee(data, token)
    },
    onSuccess: (data) => {
      console.log('Employee added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['employees'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding designation:', error)
    },
  })

  return mutation
}

export const useEditEmployee = ({
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
    mutationFn: ({ id, data }: { id: number; data: CreateEmployeeType }) => {
      return editEmployee(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Employee information edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['employees'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing Mobile Allowance Policy:', error)
    },
  })

  return mutation
}

//claim type balance
export const useGetClaimTypeBalance = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['claimTypeBalances'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllClaimTypeBalances(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useEditClaimTypeBalance = ({
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
      id,
      data,
    }: {
      id: number
      data: EditClaimTypeBalanceType
    }) => {
      return EditClaimTypeBalance(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Claim type balance edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['claimTypeBalances'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing Mobile Allowance Policy:', error)
    },
  })

  return mutation
}

//claim
export const useGetClaim = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['claims'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllClaims(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useEditClaim = ({
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
    mutationFn: ({ id, data }: { id: number; data: EditClaimType }) => {
      return editClaim(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Claim information edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['claims'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing Designation:', error)
    },
  })

  return mutation
}

export const useGetEmployeeClaim = (empId: number, claimType: string) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['claims', empId, claimType],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getEmployeeClaims(token, empId, claimType)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetClaimBalance = (empId: number, claimType: string) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['balance', empId, claimType],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getClaimBalance(token, empId, claimType)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useIsNewClaimPossible = (empId: number, amount: number) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['claims', empId, amount],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getIsNewClaimPossible(token, empId, amount)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddClaim = ({
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
    mutationFn: (data: CreateClaimType) => {
      return createClaim(data, token)
    },
    onSuccess: (data) => {
      console.log('Claim added successfully:', data)

      if (data.error) {
        toast({
          title: 'Error',
          description:
            (data?.error?.details as any)?.message || 'Failed to create claim',
        })
      } else {
        toast({
          title: 'Success',
          description: `${data.data?.claimType} claim created successfully!`,
        })
      }

      queryClient.invalidateQueries({ queryKey: ['claims'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding designation:', error)

      toast({
        title: 'Error',
        description: error?.message || 'Failed to create claim',
      })
    },
  })

  return mutation
}

export const useApproveClaim = ({
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
    mutationFn: ({ id }: { id: number }) => {
      return approveClaim(id, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Claim approved successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['claims'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing Mobile Allowance Policy:', error)
    },
  })

  return mutation
}

//travel claim
export const useGetTravelClaim = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['travelClaims'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllTravelClaims(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetTravelAmounts = (
  designationId: number,
  cityType: string,
  options?: { enabled?: boolean }
) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['travelClaims', designationId, cityType],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getTravelAmounts(token, designationId, cityType)
    },
    enabled: !!token && (options?.enabled ?? true),
    select: (data) => {
      if (!data) {
        toast({
          title: 'Policy not found',
          description:
            'No travel policy available for this designation and city type.',
        })
      }
      return data
    },
  })
}

export const useAddTravelClaim = ({
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
    mutationFn: (data: CreateTravelClaimType) => {
      return createTravelClaim(data, token)
    },
    onSuccess: (data) => {
      console.log('Claim added successfully:', data)

      if (data.error) {
        toast({
          title: 'Error',
          description:
            (data?.error?.details as any)?.message || 'Failed to create claim',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Travel claim created successfully!',
        })
      }

      queryClient.invalidateQueries({ queryKey: ['travelClaims'] })

      reset()
      onClose()
    },
    onError: (error: any) => {
      console.error('Error adding travel claim:', error)

      let message =
        error?.details?.message ||
        error?.message ||
        'Failed to create travel claim'

      toast({
        title: 'Error',
        description: message,
      })
    },
  })

  return mutation
}

export const useApproveTravelClaim = ({
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
    mutationFn: ({ id }: { id: number }) => {
      return approveTravelClaim(id, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Claim approved successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['travelClaims'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing Mobile Allowance Policy:', error)
    },
  })

  return mutation
}

//birthday report
export const useGetBirthdayReport = (fromDate: string, toDate: string) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['birthdayReport', fromDate, toDate],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getBirthdayReport(token, fromDate, toDate)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

//claim report
export const useGetEmployeeClaimsReport = (
  fromDate: string,
  toDate: string,
  empId: number
) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['employeeClaimsReport', fromDate, toDate, empId],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getEmployeeClaimsReport(token, fromDate, toDate, empId)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetCurrentMonthTotalClaimAmount = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['totalClaimAmount'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getCurrentMonthTotalClaimAmount(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetCurrentMonthClaimsCount = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['claimsCount'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getCurrentMonthClaimsCount(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useGetEmployeeSalaryHistory = (empId: number, year: number) => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['employeeSalaryHistory', empId, year],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getEmployeeSalaryHistory(empId, year, token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}
