import { fetchApi } from '@/utils/http'
import {
  SignInRequest,
  SignInResponse,
  SignInResponseSchema,
  CreateItemType,
  GetItemType,
  GetBankAccountType,
  CreateBankAccountType,
  GetVendorType,
  CreateVendorType,
  GetPurchaseType,
  CreatePurchaseType,
  GetSortingType,
  CreateSortingType,
} from '@/utils/type'

export async function signIn(credentials: SignInRequest) {
  return fetchApi<SignInResponse>({
    url: 'api/auth/login',
    method: 'POST',
    body: credentials,
    schema: SignInResponseSchema,
  })
}

export async function getAllItems(token: string) {
  return fetchApi<GetItemType[]>({
    url: 'api/item/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createItem(
  data: CreateItemType,
  token: string
) {
  return fetchApi<CreateItemType>({
    url: 'api/item/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllBankAccounts(token: string) {
  return fetchApi<GetBankAccountType[]>({
    url: 'api/bank-account/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createBankAccount(
  data: CreateBankAccountType,
  token: string
) {
  return fetchApi<CreateBankAccountType>({
    url: 'api/bank-account/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editBankAccount(
  id: number,
  data: GetBankAccountType,
  token: string
) {
  return fetchApi<GetBankAccountType>({
    url: `api/bank-account/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllVendors(token: string) {
  return fetchApi<GetVendorType[]>({
    url: 'api/vendor/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createVendor(
  data: CreateVendorType,
  token: string
) {
  return fetchApi<CreateVendorType>({
    url: 'api/vendor/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editVendor(
  id: number,
  data: GetVendorType,
  token: string
) {
  return fetchApi<GetVendorType>({
    url: `api/vendor/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllPurchases(token: string) {
  return fetchApi<GetPurchaseType[]>({
    url: 'api/purchase/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createPurchase(
  data: CreatePurchaseType,
  token: string
) {
  return fetchApi<CreatePurchaseType>({
    url: 'api/purchase/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllSortings(token: string) {
  return fetchApi<GetSortingType[]>({
    url: 'api/sorting/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createSorting(
  purchaseId: number,
  data: CreateSortingType,
  token: string
) {
  return fetchApi<CreateSortingType>({
    url: `api/sorting/create/${purchaseId}`,
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editSorting(
  id: number,
  data: GetSortingType,
  token: string
) {
  return fetchApi<GetSortingType>({
    url: `api/sorting/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}


























export async function getAllDesignations(token: string) {
  return fetchApi<GetDesignationType[]>({
    url: 'api/designation/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createDesignation(
  data: CreateDesignationType,
  token: string
) {
  return fetchApi<CreateDesignationType>({
    url: 'api/designation/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editDesignation(
  id: number,
  data: CreateDesignationType,
  token: string
) {
  return fetchApi<CreateDesignationType>({
    url: `api/designation/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllTaPolicies(token: string) {
  return fetchApi<GetTaPolicyType[]>({
    url: 'api/ta-policy/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createTaPolicy(data: CreateTaPolicyType, token: string) {
  return fetchApi<CreateTaPolicyType>({
    url: 'api/ta-policy/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editTaPolicy(
  id: number,
  data: CreateTaPolicyType,
  token: string
) {
  return fetchApi<CreateTaPolicyType>({
    url: `api/ta-policy/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllReimbursementPolicies(token: string) {
  return fetchApi<GetReimbursementPolicyType[]>({
    url: 'api/re-imbursement-policy/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createReimbursementPolicies(
  data: CreateReimbursementPolicyType,
  token: string
) {
  return fetchApi<CreateReimbursementPolicyType>({
    url: 'api/re-imbursement-policy/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editReimbursementPolicies(
  id: number,
  data: CreateReimbursementPolicyType,
  token: string
) {
  return fetchApi<CreateReimbursementPolicyType>({
    url: `api/re-imbursement-policy/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllMobileAllowancePolicies(token: string) {
  return fetchApi<GetMobileAllowancePolicyType[]>({
    url: 'api/mobile-allowance-policy/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createMobileAllowancePolicy(
  data: CreateMobileAllowancePolicyType,
  token: string
) {
  return fetchApi<CreateMobileAllowancePolicyType>({
    url: 'api/mobile-allowance-policy/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editMobileAllowancePolicy(
  id: number,
  data: CreateMobileAllowancePolicyType,
  token: string
) {
  return fetchApi<CreateMobileAllowancePolicyType>({
    url: `api/mobile-allowance-policy/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllEmployees(token: string) {
  return fetchApi<GetEmployeeType[]>({
    url: 'api/employee/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getEmployeesBySearch(search: string, token: string) {
  return fetchApi<GetEmployeeType[]>({
    url: `api/employee/get-employees-by-search?search=${search}`,
    method: 'GET',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function createEmployee(data: CreateEmployeeType, token: string) {
  return fetchApi<CreateEmployeeType>({
    url: 'api/employee/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editEmployee(
  id: number,
  data: CreateEmployeeType,
  token: string
) {
  return fetchApi<CreateEmployeeType>({
    url: `api/employee/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllClaimTypeBalances(token: string) {
  return fetchApi<GetClaimTypeBalanceType[]>({
    url: 'api/claim-type-balance/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function EditClaimTypeBalance(
  id: number,
  data: EditClaimTypeBalanceType,
  token: string
) {
  return fetchApi<EditClaimTypeBalanceType>({
    url: `api/claim-type-balance/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllClaims(token: string) {
  return fetchApi<GetClaimType[]>({
    url: 'api/claim/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editClaim(
  id: number,
  data: EditClaimType,
  token: string
) {
  return fetchApi<EditClaimType>({
    url: `api/claim/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getEmployeeClaims(
  token: string,
  empId: number,
  claimType: string
) {
  return fetchApi<Claims[]>({
    url: `api/claim/get/${empId}/${claimType}`,
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getClaimBalance(
  token: string,
  empId: number,
  claimType: string
) {
  return fetchApi<{ balance: string }>({
    url: `api/claim-type-balance/get-claim-balance/${empId}/${claimType}`,
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getIsNewClaimPossible(
  token: string,
  empId: number,
  amount: number
) {
  return fetchApi<{ eligible: boolean; reason: string }>({
    url: `api/claim/geteligibility?empId=${empId}&amount=${amount}`,
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createClaim(data: CreateClaimType, token: string) {
  return fetchApi<CreateClaimType>({
    url: 'api/claim/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function approveClaim(id: number, token: string) {
  return fetchApi({
    url: `api/claim/approve/${id}`,
    method: 'PATCH',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllTravelClaims(token: string) {
  return fetchApi<GetTravelClaimType[]>({
    url: 'api/travel-claim/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getTravelAmounts(
  token: string,
  designationId: number,
  cityType: string
) {
  return fetchApi<{ dailyAllowance: number; accomodationAmount: number }>({
    url: `api/travel-claim/travel-amounts/${designationId}/${cityType}`,
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createTravelClaim(
  data: CreateTravelClaimType,
  token: string
) {
  return fetchApi<CreateTravelClaimType>({
    url: 'api/travel-claim/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function approveTravelClaim(id: number, token: string) {
  return fetchApi({
    url: `api/travel-claim/approve/${id}`,
    method: 'PATCH',
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getBirthdayReport(token: string, fromDate: string, toDate: string) {
  return fetchApi<BirthdayReportType[]>({
    url: `api/report/get-birthday-report?fromDate=${fromDate}&toDate=${toDate}`,
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getEmployeeClaimsReport(
  token: string,
  fromDate: string,
  toDate: string,
  empId: number
) {
  return fetchApi<EmployeeClaimReportType[]>({
    url: `api/report/get-employee-claims?fromDate=${fromDate}&toDate=${toDate}`,
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getCurrentMonthClaimsCount(token: string) {
  return fetchApi<number>({
    url: 'api/dashboard/get-claim-count',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getCurrentMonthTotalClaimAmount(token: string) {
  return fetchApi<number>({
    url: 'api/dashboard/get-claim-amount',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getEmployeeSalaryHistory(empId: number, year: number, token: string) {
  return fetchApi<GetEmployeeSalaryHistoryType>({
    url: `api/employee-history/get/${empId}/${year}`,
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}
