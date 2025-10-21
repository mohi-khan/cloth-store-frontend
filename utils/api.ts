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
  GetCustomerType,
  CreateCustomerType,
  GetSalesType,
  CreateSalesType,
  GetAccountHeadType,
  CreateAccountHeadType,
  GetExpenseType,
  CreateExpenseType,
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

export async function getAllCustomers(token: string) {
  return fetchApi<GetCustomerType[]>({
    url: 'api/customer/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createCustomer(
  data: CreateCustomerType,
  token: string
) {
  return fetchApi<CreateCustomerType>({
    url: 'api/customer/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editCustomer(
  id: number,
  data: GetCustomerType,
  token: string
) {
  return fetchApi<GetCustomerType>({
    url: `api/customer/edit/${id}`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllSales(token: string) {
  return fetchApi<GetSalesType[]>({
    url: 'api/sales/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createSale(
  data: CreateSalesType,
  token: string
) {
  return fetchApi<CreateSalesType>({
    url: 'api/sales/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function editSale(
  id: number,
  data: GetSalesType,
  token: string
) {
  return fetchApi<GetSalesType>({
    url: `api/sales/edit`,
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllAccountHeads(token: string) {
  return fetchApi<GetAccountHeadType[]>({
    url: 'api/account-head/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createAccountHead(
  data: CreateAccountHeadType,
  token: string
) {
  return fetchApi<CreateAccountHeadType>({
    url: 'api/account-head/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function getAllExpenses(token: string) {
  return fetchApi<GetExpenseType[]>({
    url: 'api/expense/getAll',
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}

export async function createExpense(
  data: CreateExpenseType,
  token: string
) {
  return fetchApi<CreateExpenseType>({
    url: 'api/expense/create',
    method: 'POST',
    body: data,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })
}