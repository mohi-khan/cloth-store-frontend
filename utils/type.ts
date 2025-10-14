import { z } from 'zod'

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

export const itemSchema = z.object({
  itemId: z.number().optional(),
  itemName: z.string().min(1, 'Item name is required'),
  sellPriece: z.number().positive('Sell price must be a positive number'),
  createdBy: z.number(),
  createdAt: z.coerce.date().optional().nullable(),
  updatedBy: z.number().optional(),
  updatedAt: z.coerce.date().optional().nullable(),
})
export const createItemSchema = itemSchema.omit({ itemId: true })
export type GetItemType = z.infer<typeof itemSchema>
export type CreateItemType = z.infer<typeof createItemSchema>

export const bankAccountSchema = z.object({
  bankAccountId: z.number().int().optional(),
  bankName: z.string().min(1, 'Bank name is required').max(100),
  accountNumber: z.string().min(1, 'Account number is required').max(50),
  branch: z.string().max(100).optional().nullable(),
  createdBy: z.number().int(),
  createdAt: z.date().optional(),
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createBankAccountSchema = bankAccountSchema.omit({
  bankAccountId: true,
})
export type GetBankAccountType = z.infer<typeof bankAccountSchema>
export type CreateBankAccountType = z.infer<typeof createBankAccountSchema>

export const vendorSchema = z.object({
  vendorId: z.number().int().optional(),
  name: z.string().min(1, 'Vendor name is required').max(100),
  contactPerson: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email('Invalid email format')
    .max(100)
    .optional()
    .nullable(),
  address: z.string().max(255).optional().nullable(),
  createdBy: z.number().int(),
  createdAt: z.date().optional(),
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createVendorSchema = vendorSchema.omit({ vendorId: true })
export type GetVendorType = z.infer<typeof vendorSchema>
export type CreateVendorType = z.infer<typeof createVendorSchema>

export const purchaseSchema = z.object({
  purchaseId: z.number().int().optional(), // Auto-increment primary key
  itemId: z.number().int(), // Foreign key, required
  totalQuantity: z.number().int().min(1, 'Total quantity must be at least 1'),
  notes: z.string().optional().nullable(),
  vendorId: z.number().int(), // Foreign key, required
  paymentType: z.enum(['cash', 'credit', 'bank', 'mfs']),
  bankAccountId: z.number().int().optional().nullable(), // Foreign key, can be null
  purchaseDate: z.date(),
  totalAmount: z.number().min(0, 'Total amount must be at least 0'),
  isSorted: z.boolean().optional().default(false),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // Default set by DB
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createPurchaseSchema = purchaseSchema.omit({ purchaseId: true })
export type GetPurchaseType = z.infer<typeof purchaseSchema> & {
  itemName: string
  vendorName: string
  bankName: string
  branch: string
  accountNumber: string
}
export type CreatePurchaseType = z.infer<typeof createPurchaseSchema>

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
