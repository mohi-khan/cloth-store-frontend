import '.././globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { DashboardSidebar } from '@/components/dashboard/sidebar/dashboard-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Navbar from '@/components/shared/navbar'
import { Toaster } from '@/components/ui/toaster'
import { ReactQueryProvider } from '@/provider/ReactQueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'cloth store',
  description: 'Created with Next.js, TypeScript, Tailwind CSS, and shadcn/ui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <Navbar />
          <SidebarProvider>
            <DashboardSidebar />
            <SidebarInset>
              <main className="p-6">{children}</main>
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
