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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  useGetInventoryItems,
  useGetCustomerPaymentDetails,
  useGetCashInHand,
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

const DashboardOverview = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)
  const [token] = useAtom(tokenAtom)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type:
      | 'inventory'
      | 'customer-payment'
      | 'claim-month'
      | 'claim-value'
      | 'purchases'
      | null
    title: string
  }>({
    isOpen: false,
    type: null,
    title: '',
  })

  const { data: InventoryItems } = useGetInventoryItems()
  console.log("🚀 ~ DashboardOverview ~ InventoryItems:", InventoryItems)
  const { data: customerPaymentDetails } = useGetCustomerPaymentDetails()
  console.log("🚀 ~ DashboardOverview ~ customerPaymentDetails:", customerPaymentDetails)
  const { data: cashInHand } = useGetCashInHand()
  console.log("🚀 ~ DashboardOverview ~ cashInHand:", cashInHand)

  const totalAmount = InventoryItems?.data?.reduce((sum: number, item: any) => {
    const qty = Math.max(item.totQty, 0)
    return sum + qty * item.price
  }, 0)

  const totalUnpaidAmount = customerPaymentDetails?.data?.reduce(
    (sum: number, item: any) => {
      return sum + (item.unpaid_amount || 0)
    },
    0
  )

  const totalCashInHand = cashInHand?.data?.reduce(
    (sum: number, item: any) => {
      return sum + (item.cashInHand || 0)
    },
    0
  )

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

  const staticModalData = {
    'claim-month': [
      { description: 'Claim 001', amount: 15000 },
      { description: 'Claim 002', amount: 8500 },
      { description: 'Claim 003', amount: 12000 },
    ],
    'claim-value': [
      { category: 'Equipment', value: 45000 },
      { category: 'Maintenance', value: 35000 },
      { category: 'Other', value: 40000 },
    ],
    purchases: [
      { itemName: 'Office Supplies', quantity: 150, totalAmount: 45000 },
      { itemName: 'Equipment', quantity: 25, totalAmount: 75000 },
    ],
  }

  const openModal = (
    type:
      | 'inventory'
      | 'customer-payment'
      | 'claim-month'
      | 'claim-value'
      | 'purchases'
  ) => {
    const titles = {
      inventory: 'Total Inventory Items',
      'customer-payment': 'Customer Payment Details',
      'claim-month': "This Month's Claims",
      'claim-value': 'Claim Value Details',
      purchases: 'Fiscal Year Purchases',
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
      trend: '+12%',
      trendUp: true,
      onClick: () => openModal('inventory'),
    },
    {
      title: 'Total Unpaid Amount',
      value: totalUnpaidAmount || 0,
      icon: BarChart3,
      color: 'bg-emerald-500',
      trend: '+8.2%',
      trendUp: true,
      onClick: () => openModal('customer-payment'),
    },
    {
      title: 'Cash In Hand',
      value: totalCashInHand || 0,
      icon: Wallet,
      color: 'bg-red-500',
      trend: '+5.1%',
      trendUp: true,
      onClick: () => openModal('claim-value'),
    },
    {
      title: 'Fiscal Year Purchases',
      value: '120,000',
      subtitle: '24 Claims',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      trend: '+15.3%',
      trendUp: true,
      onClick: () => openModal('purchases'),
    },
  ]

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const today = new Date()
    const isCurrentMonth =
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()

    const days = []

    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      0
    )
    const prevMonthDays = prevMonth.getDate()

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div
          key={`prev-${prevMonthDays - i}`}
          className="text-center p-2 text-sm text-gray-400"
        >
          {prevMonthDays - i}
        </div>
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate()
      days.push(
        <div
          key={day}
          className={`text-center p-2 text-sm cursor-pointer rounded-md transition-colors ${
            isToday
              ? 'bg-yellow-500 text-white font-semibold'
              : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </div>
      )
    }

    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="text-center p-2 text-sm text-gray-400"
        >
          {day}
        </div>
      )
    }

    return days
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

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

      case 'claim-month':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staticModalData['claim-month'].map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.amount.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )

      case 'claim-value':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staticModalData['claim-value'].map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.value.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )

      case 'purchases':
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staticModalData.purchases.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.totalAmount.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Claim management & statistics overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">All metrics trending up</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={metric.onClick}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {typeof metric.value === 'number'
                      ? metric.value.toLocaleString('th-TH', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      : metric.value}
                  </p>
                  {metric.subtitle && (
                    <p className="text-sm text-gray-500">{metric.subtitle}</p>
                  )}
                  <div
                    className={`flex items-center gap-1 text-xs mt-2 ${
                      metric.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <TrendingUp
                      className={`h-3 w-3 ${!metric.trendUp ? 'rotate-180' : ''}`}
                    />
                    <span>{metric.trend}</span>
                  </div>
                </div>
                <div className={`${metric.color} p-3 rounded-xl shadow-sm`}>
                  {metric.icon && (
                    <metric.icon className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Calendar Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Claim Value by Category */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-yellow-600" />
              Claim Value by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="h-64 w-64 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {pieData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-gray-700">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Calendar */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center p-2 text-sm font-semibold text-gray-600 border-b"
                >
                  {day}
                </div>
              ))}
              {renderCalendar()}
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

const pieData = [
  { name: 'Equipment', value: 95000, percentage: 79.2, color: '#059669' },
  { name: 'Furniture', value: 15000, percentage: 12.5, color: '#0891b2' },
  { name: 'Technology', value: 8000, percentage: 6.7, color: '#7c3aed' },
  { name: 'Other', value: 2000, percentage: 1.6, color: '#e5e7eb' },
]

export default DashboardOverview
