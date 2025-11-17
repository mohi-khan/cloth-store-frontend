'use client'

import {
  Settings,
  BarChart3,
  Wallet,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  useGetInventoryItems,
  useGetCustomerPaymentDetails,
  useGetCashInHand,
  useGetProfitSummary,
  useGetBankAccountBalanceSummary,
  useGetPurchaseSummary,
} from '@/hooks/use-api'
import { Popup } from '@/utils/popup'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetPurchaseSummaryType } from '@/utils/type'

const DashboardOverview = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'inventory' | 'customer-payment' | 'claim-month' | 'purchases' | null
    title: string
  }>({
    isOpen: false,
    type: null,
    title: '',
  })

  const { data: InventoryItems } = useGetInventoryItems()
  console.log('🚀 ~ DashboardOverview ~ InventoryItems:', InventoryItems)
  const { data: customerPaymentDetails } = useGetCustomerPaymentDetails()
  console.log(
    '🚀 ~ DashboardOverview ~ customerPaymentDetails:',
    customerPaymentDetails
  )
  const { data: cashInHand } = useGetCashInHand()
  console.log('🚀 ~ DashboardOverview ~ cashInHand:', cashInHand)
  const { data: profitSummary } = useGetProfitSummary()
  console.log('🚀 ~ DashboardOverview ~ profitSummary:', profitSummary)
  const { data: purchaseSummary } = useGetPurchaseSummary()
  console.log('🚀 ~ DashboardOverview ~ purchaseSummary:', purchaseSummary)
  const { data: bankBalanceSummary } = useGetBankAccountBalanceSummary()

  const totalAmount = InventoryItems?.data?.reduce((sum: number, item: any) => {
    const qty = Math.max(item.totQty, 0)
    return sum + qty * item.price
  }, 0)

  const totalPurchaseAmount = purchaseSummary?.data?.reduce(
    (sum: number, purchase: any) => {
      return sum + (purchase.totalAmount || 0)
    },
    0
  )

  const totalUnpaidAmount = customerPaymentDetails?.data?.reduce(
    (sum: number, item: any) => {
      return sum + (item.unpaid_amount || 0)
    },
    0
  )
  console.log('🚀 ~ DashboardOverview ~ totalUnpaidAmount:', totalUnpaidAmount)

  const totalCashInHand = cashInHand?.data?.reduce((sum: number, item: any) => {
    return sum + (item.amount || 0)
  }, 0)
  console.log('🚀 ~ DashboardOverview ~ totalCashInHand:', totalCashInHand)

  useEffect(() => {
    const checkUserData = () => {
      const storedUserData = localStorage.getItem('currentUser')
      const storedToken = localStorage.getItem('authToken')

      if (!storedUserData || !storedToken) {
        console.log('No user data or token found in localStorage')
        router.push('/')
        return
      }
      setIsLoading(false)
    }

    checkUserData()
  }, [userData, token, router])

  const openModal = (
    type: 'inventory' | 'customer-payment' | 'claim-month' | 'purchases'
  ) => {
    const titles = {
      inventory: 'Total Inventory Items',
      'customer-payment': 'Customer Payment Details',
      'claim-month': "This Month's Claims",
      purchases: 'Purchase Summary',
    }
    setModalState({
      isOpen: true,
      type,
      title: titles[type],
    })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, title: '' })
  }

  const metrics = [
    {
      title: 'Total Inventory amount',
      value: totalAmount || 0,
      icon: Settings,
      color: 'bg-yellow-500',
      onClick: () => openModal('inventory'),
    },
    {
      title: 'Total Outstanding Balance',
      value: totalUnpaidAmount || 0,
      icon: BarChart3,
      color: 'bg-emerald-500',
      onClick: () => openModal('customer-payment'),
    },
    {
      title: 'Cash In Hand',
      value: totalCashInHand || 0,
      icon: Wallet,
      color: 'bg-red-500',
      onClick: undefined,
    },
    {
      title: 'Purchase Summary',
      value: totalPurchaseAmount,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      onClick: () => openModal('purchases'),
    },
    ,
    ,
  ]

  const renderModalContent = () => {
    switch (modalState.type) {
      case 'inventory':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price </TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {InventoryItems?.data && InventoryItems.data.length > 0 ? (
                    InventoryItems.data.map((item: any, index: number) => {
                      const itemTotal = Math.max(item.totQty, 0) * item.price
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.item_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.totQty}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.price.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {itemTotal.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        No inventory items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {InventoryItems?.data && InventoryItems.data.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-end pr-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        Total Inventory Value:
                      </span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {totalAmount?.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'customer-payment':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead className="text-right">
                      Opening Balance
                    </TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Total Discount</TableHead>
                    <TableHead className="text-right">Total Received</TableHead>
                    <TableHead className="text-right">Unpaid Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPaymentDetails?.data &&
                  customerPaymentDetails.data.length > 0 ? (
                    customerPaymentDetails.data.map(
                      (item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.customer_name}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.opening_balance}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.total_sales.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.total_discount.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.total_received.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {item.unpaid_amount.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No customer payment details found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {customerPaymentDetails?.data &&
              customerPaymentDetails.data.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-end pr-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          Total Unpaid Amount:
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          {totalUnpaidAmount?.toLocaleString('th-TH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )

      case 'purchases':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseSummary?.data?.map(
                  (item: GetPurchaseSummaryType, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.month}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.totalAmount.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-lg"></div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          let displayValue = metric?.value
          let valueColor = 'text-gray-900'

          // Only modify Total Outstanding Balance and Cash In Hand
          if (
            metric?.title === 'Total Outstanding Balance' ||
            metric?.title === 'Cash In Hand'
          ) {
            if (typeof metric?.value === 'number') {
              displayValue = Math.abs(metric?.value) // remove minus sign

              if (metric?.title === 'Total Outstanding Balance') {
                // negative => green, positive => red
                valueColor =
                  metric?.value < 0 ? 'text-emerald-600' : 'text-red-600'
              }

              if (metric?.title === 'Cash In Hand') {
                // negative => red, positive => green
                valueColor =
                  metric?.value < 0 ? 'text-red-600' : 'text-emerald-600'
              }
            }
          }

          return (
            <Card
              key={index}
              className={`hover:shadow-lg transition-shadow duration-200 ${
                metric?.onClick ? 'cursor-pointer' : ''
              }`}
              onClick={metric?.onClick}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {metric?.title}
                    </p>
                    <p className={`text-2xl font-bold mb-1 ${valueColor}`}>
                      {typeof displayValue === 'number'
                        ? displayValue.toLocaleString('th-TH', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })
                        : displayValue}
                    </p>
                  </div>
                  <div className={`${metric?.color} p-3 rounded-xl shadow-sm`}>
                    {metric?.icon && (
                      <metric.icon className="h-6 w-6 text-white" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* profit summary and bank balance summary */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Profit Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80">
              {profitSummary?.data && profitSummary.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={profitSummary.data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 50 }}
                  >
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />

                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value: number) =>
                        value.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                    />

                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />

                    {/* Total Sales */}
                    {/* <Line
                      type="monotone"
                      dataKey="total_sales_amount"
                      stroke="#1e40af"
                      name="Total Sales"
                      strokeWidth={2.5}
                      dot={{ fill: '#1e40af', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    /> */}

                    {/* Total Expenses */}
                    <Line
                      type="monotone"
                      dataKey="total_expense"
                      stroke="#dc2626"
                      name="Total Expense"
                      strokeWidth={2.5}
                      dot={{ fill: '#dc2626', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />

                    {/* Gross Profit */}
                    <Line
                      type="monotone"
                      dataKey="gross_profit"
                      stroke="#d97706"
                      name="Gross Profit"
                      strokeWidth={2.5}
                      dot={{ fill: '#d97706', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />

                    {/* Net Profit */}
                    <Line
                      type="monotone"
                      dataKey="net_profit"
                      stroke="#059669"
                      name="Net Profit"
                      strokeWidth={2.5}
                      dot={{ fill: '#059669', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No profit data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bank Account Balance Summary Line Graph */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              Bank Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80">
              {bankBalanceSummary?.data &&
              bankBalanceSummary.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={bankBalanceSummary.data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 50 }}
                  >
                    <CartesianGrid
                      strokeDasharray="0"
                      stroke="#e5e7eb"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="bank_name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        value.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="current_balance"
                      stroke="#059669"
                      name="Current Balance"
                      strokeWidth={2.5}
                      dot={{ fill: '#059669', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No bank account data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Popup
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        size="sm:max-w-4xl"
      >
        <div className="py-4">{renderModalContent()}</div>
      </Popup>
    </div>
  )
}

export default DashboardOverview
