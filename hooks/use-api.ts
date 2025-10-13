import { tokenAtom, useInitializeUser } from '@/utils/user'
import { useAtom } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveClaim,
  approveTravelClaim,
  createClaim,
  createCompany,
  createDepartment,
  createDesignation,
  createEmployee,
  createMobileAllowancePolicy,
  createReimbursementPolicies,
  createTaPolicy,
  createTravelClaim,
  editClaim,
  EditClaimTypeBalance,
  editDesignation,
  editEmployee,
  editMobileAllowancePolicy,
  editReimbursementPolicies,
  editTaPolicy,
  getAllClaims,
  getAllClaimTypeBalances,
  getAllCompanies,
  getAllDepartments,
  getAllDesignations,
  getAllEmployees,
  getAllMobileAllowancePolicies,
  getAllReimbursementPolicies,
  getAllTaPolicies,
  getAllTravelClaims,
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
  CreateClaimType,
  CreateCompanyType,
  CreateDepartmentType,
  CreateDesignationType,
  CreateEmployeeType,
  CreateMobileAllowancePolicyType,
  CreateReimbursementPolicyType,
  CreateTaPolicyType,
  CreateTravelClaimType,
  EditClaimType,
  EditClaimTypeBalanceType,
  GetDesignationType,
  GetMobileAllowancePolicyType,
  GetReimbursementPolicyType,
  GetTaPolicyType,
} from '@/utils/type'
import { toast } from './use-toast'

//company
export const useGetCompanies = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['companies'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllCompanies(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddCompany = ({
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
    mutationFn: (data: CreateCompanyType) => {
      return createCompany(data, token)
    },
    onSuccess: (data) => {
      console.log('company added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['companies'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding company:', error)
    },
  })

  return mutation
}

//department
export const useGetDepartments = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['departments'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllDepartments(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddDepartment = ({
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
    mutationFn: (data: CreateDepartmentType) => {
      return createDepartment(data, token)
    },
    onSuccess: (data) => {
      console.log('department added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['departments'] })

      // Reset form fields after success
      reset()

      // Close the form modal
      onClose()
    },
    onError: (error) => {
      // Handle error
      console.error('Error adding department:', error)
    },
  })

  return mutation
}

//designation
export const useGetDesignations = () => {
  const [token] = useAtom(tokenAtom)
  useInitializeUser()

  return useQuery({
    queryKey: ['designations'],
    queryFn: () => {
      if (!token) {
        throw new Error('Token not found')
      }
      return getAllDesignations(token)
    },
    enabled: !!token,
    select: (data) => data,
  })
}

export const useAddDesignation = ({
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
    mutationFn: (data: CreateDesignationType) => {
      return createDesignation(data, token)
    },
    onSuccess: (data) => {
      console.log('designation added successfully:', data)

      queryClient.invalidateQueries({ queryKey: ['designations'] })

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

export const useEditDesignation = ({
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
    mutationFn: ({ id, data }: { id: number; data: GetDesignationType }) => {
      return editDesignation(id, data, token)
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Designation information edited successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['designations'] })

      reset()
      onClose()
    },
    onError: (error) => {
      console.error('Error editing Designation:', error)
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
