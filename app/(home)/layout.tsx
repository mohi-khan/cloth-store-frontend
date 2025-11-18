import { Toaster } from '@/components/ui/toaster'
import '.././globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="">
          <div className="bg-white rounded">{children}</div>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
