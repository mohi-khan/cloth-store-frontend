import Dashboard from '@/components/dashboard/dashboard'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import React from 'react'

const DashboardPage = () => {
  return (
    <div>
      <Dashboard />
    </div>
  )
}

export default DashboardPage
