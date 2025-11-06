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
  isBulk: z.boolean().optional().default(false),
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
  accountName: z.string().min(1, 'Account name is required').max(100),
  balance: z.number().min(0, 'Balance must be at least 0'),
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

export const sortingSchema = z.object({
  sortingId: z.number().int().optional(), // Auto-increment primary key
  itemId: z.number().int(), // Foreign key, required
  totalQuantity: z.number().int().min(1, 'Total quantity must be at least 1'),
  notes: z.string().optional().nullable(),
  vendorId: z.number().int(), // Foreign key, required
  purchaseId: z.number().int(), // Foreign key, required
  paymentType: z.enum(['cash', 'credit', 'bank', 'mfs']),
  bankAccountId: z.number().int().optional().nullable(), // Can be null (onDelete: set null)
  sortingDate: z.date(),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // Default is DB timestamp
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createSortingSchema = sortingSchema.omit({ sortingId: true })
export type GetSortingType = z.infer<typeof sortingSchema> & {
  itemName: string
  vendorName: string
  bankName: string
  branch: string
  accountNumber: string
}
export type CreateSortingType = z.infer<typeof createSortingSchema>

export const customerSchema = z.object({
  customerId: z.number().int().optional(), // Auto-increment primary key
  name: z.string().min(1, 'Customer name is required').max(100),
  phone: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email('Invalid email format')
    .max(100)
    .optional()
    .nullable(),
  address: z.string().max(255).optional().nullable(),
  balance: z.number().min(0, 'Balance must be at least 0'),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // Automatically handled by DB
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createCustomerSchema = customerSchema.omit({ customerId: true })
export type CreateCustomerType = z.infer<typeof createCustomerSchema>
export type GetCustomerType = z.infer<typeof customerSchema>

// salesMaster schema
export const salesMasterSchema = z.object({
  saleMasterId: z.number().int().optional(),
  paymentType: z.enum(['cash', 'credit', 'bank', 'mfs']),
  bankAccountId: z.number().int().nullable().optional(),
  customerId: z.number().int(),
  saleDate: z.date(),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  totalQuantity: z.number().int().min(1, 'Total quantity must be at least 1'),
  notes: z.string().optional().nullable(),
  discountAmount: z.number().min(0).optional().default(0),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // Automatically handled by DB
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export type GetSalesMasterType = z.infer<typeof salesMasterSchema> & {
  customerName: string
  bankName: string | null
}

// saleDetails schema
export const saleDetailsSchema = z.object({
  saleDetailsId: z.number().int().optional(),
  salesMasterId: z.number().int().optional(),
  itemId: z.number().int(),
  avgPrice: z.number().int().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  amount: z.number().min(0, 'Amount must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // Automatically handled by DB
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export type GetSaleDetailsType = z.infer<typeof saleDetailsSchema> & {
  itemName: string | undefined
}

// sales combined schema
export const salesSchema = z.object({
  salesMaster: salesMasterSchema,
  saleDetails: z
    .array(saleDetailsSchema)
    .min(1, 'At least one sale detail is required'),
})

// Create salesMasterSchema
const salesMasterCreateSchema = salesMasterSchema.omit({
  saleMasterId: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
})

// Create saleDetailsSchema
const saleDetailsCreateSchema = saleDetailsSchema.omit({
  saleDetailsId: true,
  salesMasterId: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
})

// Combined create schema
export const salesCreateSchema = z.object({
  salesMaster: salesMasterCreateSchema,
  saleDetails: z
    .array(saleDetailsCreateSchema)
    .min(1, 'At least one sale detail is required'),
})
export type CreateSalesType = z.infer<typeof salesCreateSchema>
export type GetSalesType = z.infer<typeof salesSchema>

export const accountHeadSchema = z.object({
  accountHeadId: z.number().int().optional(),
  name: z.string().min(1, 'Account Head name is required').max(100),
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // Automatically handled by DB
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createAccountHeadSchema = accountHeadSchema.omit({
  accountHeadId: true,
})
export type GetAccountHeadType = z.infer<typeof accountHeadSchema>
export type CreateAccountHeadType = z.infer<typeof createAccountHeadSchema>

export const expenseSchema = z.object({
  expenseId: z.number().int().optional(), // Auto-increment primary key
  accountHeadId: z.number().int(), // Foreign key, required
  amount: z.number().min(0, 'Amount must be positive'),
  expenseDate: z.date(),
  remarks: z.string().optional().nullable(),
  paymentType: z.enum(['bank', 'cash', 'mfs']),
  bankAccountId: z.number().int().optional().nullable(), // Foreign key, can be null
  createdBy: z.number().int(),
  createdAt: z.date().optional(), // Auto-handled by DB
  updatedBy: z.number().int().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
})
export const createExpenseSchema = expenseSchema.omit({ expenseId: true })
export type GetExpenseType = z.infer<typeof expenseSchema> & {
  accountHeadName: string
  bankName: string | null
  branch: string | null
  accountNumber: string | null
}
export type CreateExpenseType = z.infer<typeof createExpenseSchema>

export const inventoryItems = z.object({
  item_name: z.string(),
  totQty: z.number(),
  price: z.number(),
});
export type GetInventoryItemsType = z.infer<typeof inventoryItems>;

export const customerPaymentSchema = z.object({
  customer_id: z.number(),
  customer_name: z.string(),
  total_sales: z.number(),
  total_discount: z.number(),
  total_received: z.number(),
  unpaid_amount: z.number(),
});
export type GetCustomerPaymentDetailsType = z.infer<typeof customerPaymentSchema>;

export const transactionSchema = z.object({
  transactionId: z.number().int().optional(), // auto-increment
  transactionType: z.enum(['payment', 'received', 'contra']).nullable(),
  isCash: z.boolean().default(true),
  bankId: z.number().int().nullable(),
  customerId: z.number().int().nullable(),
  vendorId: z.number().int().nullable(),
  transactionDate: z.string().nullable(), // 'YYYY-MM-DD'
  amount: z.number().nullable(),
  createdBy: z.number().int(),
  createdAt: z.string().datetime(), // or z.date() if you prefer date object
  updatedBy: z.number().int().nullable(),
  updatedAt: z.string().datetime().nullable(),
})
export type CreateTransactionType = z.infer<typeof transactionSchema>
export type GetTransactionType = z.infer<typeof transactionSchema> & {
  bankName: string | null
  branch: string | null
  bankAccount: string | null
  bankAccountName: string | null
  accountNumber: string | null
  customerName: string | null
  vendorName: string | null
}

export const OpeningBalanceSchema = z.object({
  openingBalanceId: z.number().optional(),
  openingAmount: z.number(),
  isParty: z.boolean(),
  customerId: z.number().nullable(),
  type: z.enum(['debit', 'credit']),
  createdBy: z.number(),
  createdAt: z.string(),
  updatedBy: z.number().nullable(),
  updatedAt: z.string().nullable(),
});
export type CreateOpeningBalanceType = z.infer<typeof OpeningBalanceSchema>
export type GetOpeningBalanceType = z.infer<typeof OpeningBalanceSchema>

export const cashReportSchema = z.object({
  id: z.number(),
  date: z.string(),
  particular: z.string(),
  amount: z.number(),
});
export type GetCashReportType = z.infer<typeof cashReportSchema>;

export const partyReportSchema = z.object({
  id: z.number(),
  date: z.string(),
  particular: z.string(),
  amount: z.number(),
});
export type GetPartyReportType = z.infer<typeof partyReportSchema>;

export const stockLedgerSchema = z.object({
  transaction_id: z.number(),
  item_id: z.number(),
  item_name: z.string(),
  reference_type: z.string(), // could also refine to literal types if you want
  reference: z.string().nullable(),
  quantity: z.number(),
  transaction_date: z.string().nullable(),
  balance: z.number(),
});
export type GetStockLedgerType = z.infer<typeof stockLedgerSchema>;

export const bankTransactionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['deposit', 'withdraw']),
  date: z.string(),
  bankAccountId: z.number(),
  amount: z.number(),
})
export type CreateBankTransactionType = z.infer<typeof bankTransactionSchema>;
export type GetBankTransactionType = z.infer<typeof bankTransactionSchema> & {
  bankName: string | null
  branch: string | null
  accountNumber: string | null
};

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
