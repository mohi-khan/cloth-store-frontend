import { Toaster } from '@/components/ui/toaster'
import '.././globals.css'
import { Inter } from 'next/font/google'
import HomeNavbar from '@/components/shared/home-navbar'
import Footer from '@/components/shared/footer'
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
            {/* <HomeNavbar /> */}
          <div className="bg-white rounded">{children}</div>
          {/* <Footer /> */}
          <Toaster />
        </div>
      </body>
    </html>
  )
}
