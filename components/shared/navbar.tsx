'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PlusCircle, User2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, List } from 'lucide-react';
import { tokenAtom, useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'

export default function Navbar() {
  useInitializeUser()
    const [userData] = useAtom(userDataAtom)
    const [token] = useAtom(tokenAtom)
  
    const router = useRouter()
  
    useEffect(() => {
      const checkUserData = () => {
        const storedUserData = localStorage.getItem('currentUser')
        const storedToken = localStorage.getItem('authToken')
  
        if (!storedUserData || !storedToken) {
          console.log('No user data or token found in localStorage')
          router.push('/')
          return
        }
      }
  
      checkUserData()
    }, [userData, token, router])
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const companiesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        companiesRef.current &&
        !companiesRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileRef, companiesRef])
  
  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    setIsProfileOpen(false)
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 border-b">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-800">Biz</span>
              <span className="text-2xl font-bold text-yellow-500">Flow</span>
            </div>
          </div>
          <div className="flex items-center ml-4">
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center justify-center w-10 h-10 text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-500 ease-in-out"
                id="user-menu"
                aria-label="User menu"
                aria-haspopup="true"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User2 className="h-9 w-9 text-gray-600 border border-gray-600 p-1 rounded-full" />
              </button>
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg">
                  <div
                    className="py-1 rounded-md bg-white shadow-xs"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      href="/change-password"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Change Password
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
