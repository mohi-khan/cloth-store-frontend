import { fetchApi } from '@/utils/http'
import {
  BirthdayReportType,
  Claims,
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
  EmployeeClaimReportType,
  GetClaimType,
  GetClaimTypeBalanceType,
  GetCompanyType,
  GetDepartmentType,
  GetDesignationType,
  GetEmployeeSalaryHistoryType,
  GetEmployeeType,
  GetMobileAllowancePolicyType,
  GetReimbursementPolicyType,
  GetTaPolicyType,
  GetTravelClaimType,
  SignInRequest,
  SignInResponse,
  SignInResponseSchema,
} from '@/utils/type'

export async function createCompany(data: CreateCompanyType, token: string) {
  return fetchApi<CreateCompanyType>({
    url: 'api/company/create-company',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllCompanies(token: string) {
  return fetchApi<GetCompanyType[]>({
    url: 'api/company/get-all-companies',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function signIn(credentials: SignInRequest) {
  return fetchApi<SignInResponse>({
    url: 'api/auth/login',
    method: 'POST',
    body: credentials,
    schema: SignInResponseSchema,
  })
}

export async function getAllDepartments(token: string) {
  return fetchApi<GetDepartmentType[]>({
    url: 'api/department/getall',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createDepartment(
  data: CreateDepartmentType,
  token: string
) {
  return fetchApi<CreateDepartmentType>({
    url: 'api/department/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
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
