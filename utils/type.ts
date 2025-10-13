import { z } from 'zod'

export const companySchema = z.object({
  companyId: z.number().int().positive(), // primary key
  companyName: z.string().max(100),
  address: z.string().max(255).nullable().optional(),
  city: z.string().max(50).nullable().optional(),
  state: z.string().max(50).nullable().optional(),
  country: z.string().max(50).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().max(100).nullable().optional(),
  website: z.string().url().max(100).nullable().optional(),
  taxId: z.string().max(50).nullable().optional(),
  logo: z.string().nullable().optional(), // text column
  parentCompanyId: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(), // default is true
  createdAt: z.string().datetime().optional(), // timestamp
  updatedAt: z.string().datetime().optional(), // timestamp
})
export const createCompanySchema = companySchema.omit({ companyId: true })
export type GetCompanyType = z.infer<typeof companySchema>
export type CreateCompanyType = z.infer<typeof createCompanySchema>

export const SignInRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const RolePermissionSchema = z.object({
  roleId: z.number(),
  permissionId: z.number(),
  permission: PermissionSchema,
})

export const RoleSchema = z.object({
  roleId: z.number(),
  roleName: z.string(),
  rolePermissions: z.array(RolePermissionSchema),
})

export const UserCompanySchema = z.object({
  userId: z.number(),
  companyId: z.number(),
  company: companySchema,
})

export const UserSchema = z.object({
  userId: z.number(),
  username: z.string(),
  password: z.string(),
  active: z.boolean(),
  roleId: z.number(),
  isPasswordResetRequired: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  role: RoleSchema,
})

export const SignInResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
})

export type SignInRequest = z.infer<typeof SignInRequestSchema>
export type SignInResponse = z.infer<typeof SignInResponseSchema>

export const transactionSchema = z.object({
  id: z.number().int().positive(),
  transactionDate: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  transactionType: z.enum(['Deposite', 'Withdraw']),
  details: z.string(),
  amount: z.number().int(),
})
export const createTransactionSchema = transactionSchema.omit({ id: true })
export type GetTransactionType = z.infer<typeof transactionSchema>
export type CreateTransactionType = z.infer<typeof createTransactionSchema>

export const departmentSchema = z.object({
  departmentID: z.number(),
  departmentName: z.string().min(1, 'Department name is required'),
  budget: z.number().optional(),
  companyCode: z.number().optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  createdBy: z.number(),
  actual: z.number().optional(),
})
export const createDepartmentSchema = departmentSchema.omit({
  departmentID: true,
})
export type GetDepartmentType = z.infer<typeof departmentSchema> & {
  companyName: string
}
export type CreateDepartmentType = z.infer<typeof createDepartmentSchema>

export const designationSchema = z.object({
  designationID: z.number().int().optional(), // Auto-incremented
  designationCode: z.string().max(255),
  designationName: z.string().max(255),
  grade: z.string().max(50).optional(),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // default is CURRENT_TIMESTAMP
  updatedBy: z.number().int().nullable().optional(),
})
export const createDesignationSchema = designationSchema.omit({
  designationID: true,
})
export type GetDesignationType = z.infer<typeof designationSchema>
export type CreateDesignationType = z.infer<typeof createDesignationSchema>

export const taPolicySchema = z.object({
  id: z.number().int().optional(), // auto-incremented
  designationId: z.number().int().optional(),
  travelingCity: z.enum(['Dhaka', 'Chittagong', 'Others']),
  accomodationAmount: z.number(), // not null
  dailyAllowance: z.number().optional(), // nullable in DB, optional in schema
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // defaults to CURRENT_TIMESTAMP
  updatedBy: z.number().int().nullable().optional(), // nullable & optional
})
export const createTaPolicySchema = taPolicySchema.omit({ id: true }).partial()
export type GetTaPolicyType = z.infer<typeof taPolicySchema> & {
  designationName: string
}
export type CreateTaPolicyType = z.infer<typeof createTaPolicySchema>

export const reimbursementPolicySchema = z.object({
  id: z.number().optional(), // optional because it's auto-increment
  designationId: z.number().int(),
  type: z.enum(['medical', 'hospitalization']),
  amountType: z.enum(['basic_salary', 'gross_salary']),
  fixedAmount: z.number(),
  useWhicheverIsHigher: z.boolean().default(true),
  applicableTo: z.array(z.enum(['self', 'spouse', 'children'])),
  accumulableYears: z.number().int().nullable().optional(), // optional if not required always
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // can be handled by DB
  updatedBy: z.number().int().nullable().optional(),
})
export const createReimbursementPolicySchema = reimbursementPolicySchema
  .omit({ id: true })
  .partial()
export type GetReimbursementPolicyType = z.infer<
  typeof reimbursementPolicySchema
>
export type CreateReimbursementPolicyType = z.infer<
  typeof createReimbursementPolicySchema
>

export const mobileAllowancePolicySchema = z.object({
  id: z.number().optional(), // auto-incremented, so optional
  designationId: z.number().int(),
  isSales: z.boolean().default(false),
  amount: z.number(),
  remarks: z.string().nullable().optional(), // text field can be null
  accumulableYears: z.number().int().nullable().optional(),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // handled by DB
  updatedBy: z.number().int().nullable().optional(),
})
export const createMobileAllowancePolicySchema = mobileAllowancePolicySchema
  .omit({ id: true })
  .partial()
export type GetMobileAllowancePolicyType = z.infer<
  typeof mobileAllowancePolicySchema
>
export type CreateMobileAllowancePolicyType = z.infer<
  typeof createMobileAllowancePolicySchema
>

export const employeeSchema = z.object({
  id: z.number().int().positive().optional(),
  empId: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  designationId: z.number().int().positive(),
  departmentId: z.number().int().positive(),
  empCat: z.enum(['officer', 'staff']),
  empType: z.enum(['contractual', 'permanent']),
  companyName: z.string().min(1).max(255),
  employeeGroup: z.enum(['management', 'non-management']),
  status: z.boolean().default(true),
  gender: z.enum(['male', 'female']),
  basicSalary: z.number().default(0.0),
  grossSalary: z.number().default(0.0),
  dateOfBirth: z.date().optional().nullable(),
  dateOfJoining: z.date().optional().nullable(),
  dateOfConfirmation: z.date().optional().nullable(),
  mobileNumber: z.string().min(10).max(15).optional().nullable(),
  location: z.string().min(1).max(255).optional().nullable(),
  createdAt: z.date().optional(),
  createdBy: z.number().int().positive(),
  updatedBy: z.number().int().positive().nullable().optional(),
  updatedAt: z.date().optional(),
})
export const createEmployeeSchema = employeeSchema.omit({ id: true }).partial()
export type GetEmployeeType = z.infer<typeof employeeSchema> & {
  companyName: string
  departmentName: string
  designationName: string
}
export type CreateEmployeeType = z.infer<typeof createEmployeeSchema>

export const claimTypeBalanceSchema = z.object({
  claimTypeId: z.number().int().positive().optional(), // auto-increment PK, optional for insert
  empId: z.number().int().positive(),
  claimType: z.enum(['Medicine', 'Hospital', 'Travel', 'Mobile Handset']),
  amount: z.number(),
  notes: z.string().nullable().optional(),
  claimDate: z.date(),
  createdBy: z.number().int().positive(),
  createdAt: z.date().optional(), // DB defaults to now
  updatedBy: z.number().int().positive(),
  updatedAt: z.date().nullable().optional(), // updated automatically
})
export type GetClaimTypeBalanceType = z.infer<typeof claimTypeBalanceSchema> & {
  employeeName: string
}
export type EditClaimTypeBalanceType = z.infer<typeof claimTypeBalanceSchema>

export const claimSchema = z.object({
  claimId: z.number().int().positive().optional(), // auto-increment, usually optional for inserts
  empId: z.number().int().positive(),
  designationId: z.number().int().positive(),
  departmentId: z.number().int().positive(),
  claimType: z.enum(['Medicine', 'Hospital', 'Travel', 'Mobile Handset']),
  claimTypeBalanceId: z.number().int().positive().nullable().optional(),
  handSetName: z.string().max(255).nullable().optional(),
  totalPrice: z.number().nullable().optional(),
  claimDate: z.date(),
  balance: z.number(),
  claimAmount: z.number(),
  afterBalance: z.number().optional(),
  notes: z.string().nullable().optional(),
  isApproved: z.boolean().default(false),
  createdBy: z.number().int().positive(),
  createdAt: z.date().optional(), // defaultNow() → optional on insert
  updatedBy: z.number().int().positive().nullable().optional(),
  updatedAt: z.date().nullable().optional(), // auto-updated
})
export type CreateClaimType = z.infer<typeof claimSchema>
export type GetClaimType = z.infer<typeof claimSchema> & {
  designationName: string
  departmentName: string
  employeeName: string
}
export type EditClaimType = Omit<z.infer<typeof claimSchema>, 'claimId'>
export type Claims = {
  claimType: string
  claimDate: Date
  approved: boolean
  claimAmount: number
  createdAt: Date
}

export const travelClaimSchema = z.object({
  id: z.number().int().optional(),
  empId: z.number().int().min(1, 'Employee ID is required'),
  designationId: z.number().int().min(1, 'Designation ID is required'),
  travelCity: z.enum(['Dhaka', 'Chittagong', 'Sylhet', "Cox'sbazar", 'Others']),
  fromDate: z.string().date('Invalid fromDate'),
  toDate: z.string().date('Invalid toDate'),
  purpose: z.string().optional().nullable(),
  accomodationAmount: z.number().optional().nullable(),
  dailyAllowance: z.number().optional().nullable(),
  transport: z.string().max(255).optional().nullable(),
  remarks: z.string().optional().nullable(),
  isApproved: z.boolean().default(false),
  createdBy: z.number().int().min(1, 'CreatedBy is required'),
  createdAt: z.date().optional(),
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createTravelClaimSchema = travelClaimSchema.omit({ id: true }).partial()
export type CreateTravelClaimType = z.infer<typeof createTravelClaimSchema>
export type GetTravelClaimType = z.infer<typeof travelClaimSchema> & {
  employeeName: string
  designationName: string
  departmentName: string
  companyName: string
}

export const birthdayReportSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  department: z.string().nullable(),
  designation: z.string().nullable(),
  companyName: z.string().nullable(),
  mobileNumber: z.string().max(15).nullable(),
  dateOfJoining: z.date().nullable(),
  dateOfBirth: z.date().nullable(),
  location: z.string().nullable(),
})
export type BirthdayReportType = z.infer<typeof birthdayReportSchema>

export const employeeClaimSchema = z.object({
  claimId: z.number(),
  empId: z.number(),
  claimType: z.string(),
  claimDate: z.string().datetime(),   // stored as ISO string from DB
  postingDate: z.string().datetime(), // createdAt alias
  claimAmount: z.number(),
  balance: z.number(),
  notes: z.string().nullable().optional(),
  isApproved: z.boolean(),
  employeeCode: z.number(),           // from employeeModel.empId
  employeeName: z.string(),
  designationId: z.number(),
  designation: z.string().nullable(),
  departmentId: z.number(),
  department: z.string().nullable(),
  companyName: z.string().nullable(),
})
export type EmployeeClaimReportType = z.infer<typeof employeeClaimSchema>

export const employeeSalaryHistorySchema = z.object({
  id: z.number(),
  empId: z.number().int().nonnegative({
    message: 'Employee ID must be a positive integer',
  }),
  basicSalary: z.number().nonnegative({
    message: 'Basic salary must be a positive number',
  }),
  grossSalary: z.number().nonnegative({
    message: 'Gross salary must be a positive number',
  }),
  year: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .refine((val) => val > 2000, {
      message: 'Year must be after 2000',
    }),
  createdBy: z.number().int().min(1, 'CreatedBy is required'),
  createdAt: z.date().optional(),
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export type GetEmployeeSalaryHistoryType = z.infer<typeof employeeSalaryHistorySchema> & {
  employeeName: string
  designationName: string
  departmentName: string
  companyName: string
}





export interface User {
  userId: number
  username: string
  roleId: number
  roleName: string
  userCompanies: Company[]
  userLocations: Location[]
  voucherTypes: string[]
}

export interface UserCompany {
  userId: number
  companyId: number
}

export interface Company {
  companyId: number
  address: string
  companyName: string
}

export interface CompanyFromLocalstorage {
  company: {
    companyId: number
    companyName: string
  }
}

export interface SubItem {
  name: string
  source: string
}

export interface SubItemGroup {
  name: string
  items: SubItem[]
}

export interface MenuItem {
  name: string
  subItemGroups: SubItemGroup[]
}

export interface LocationFromLocalstorage {
  location: {
    locationId: number
    address: string
    companyId: number
  }
}
