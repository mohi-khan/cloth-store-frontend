'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { signIn } from '@/utils/api'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!username || !password) {
      setError('Please fill in all fields.')
      setIsLoading(false)
      return
    }

    try {
      const response = await signIn({ username, password })
      console.log('🚀 ~ handleSubmit ~ response:', response)
      if (response.error || !response.data) {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to signin',
        })
      } else {
        // Log the current user information

        // Store token if remember me is checked
        localStorage.setItem('authToken', response.data.token)

        console.log(response.data.user)
        // Store user information in localStorage
        const {
          userId,
          roleId,
          // userCompanies,
          // voucherTypes,
          // employeeId,
        } = response.data.user

        const userInfo = {
          userId,
          roleId,
          // userCompanies,
          // voucherTypes,
          // employeeId,
        }
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        console.log('Current user info stored:', userInfo)

        // Redirect to dashboard
        router.push('/dashboard/dashboard-overview')
        toast({
          title: 'Success',
          description: 'you are signined in',
        })
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border border-black">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            {/* <Image
              src="/logo.webp"
              alt="Company Logo"
              width={80}
              height={80}
              className=""
            /> */}
            <h2 className="text-3xl font-bold ">Claim Management</h2>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your username and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                className="border border-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  className="border border-black"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-yellow-400 mt-10 hover:bg-yellow-500 text-black"
              disabled={isLoading}
            >
              <LockIcon className="mr-2 h-4 w-4" />
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link
            href="/forgot-password"
            className="text-sm text-center text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
