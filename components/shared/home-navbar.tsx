'use client'

import { useEffect, useState, useRef } from 'react'
import { Menu, User2, X } from 'lucide-react'
import { useInitializeUser, userDataAtom } from '@/utils/user'
import { useAtom } from 'jotai'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const HomeNavbar = () => {
  useInitializeUser()
  const [userData] = useAtom(userDataAtom)

  const router = useRouter()

  const [isScrolled, setIsScrolled] = useState(false)

  // Correctly place the useEffect to handle userData updates
  useEffect(() => {
    if (userData) {
      // Perform any logic needed when userData changes
    }
  }, [userData])
  const [active, setActive] = useState('#')
  const [open, setOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    setIsProfileOpen(false)
    router.push('/')
  }

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    setActive(sectionId)

    // Handle the case for the top of the page
    if (sectionId === '#') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }

    // Remove the # from the ID
    const targetId = sectionId.substring(1)
    const element = document.getElementById(targetId)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }

      const featuresPosition =
        document.getElementById('features')?.offsetTop || 0
      const appsPosition = document.getElementById('apps')?.offsetTop || 0
      const benefitsPosition =
        document.getElementById('benefits')?.offsetTop || 0
      const reviewsPosition = document.getElementById('reviews')?.offsetTop || 0
      const faqsPosition = document.getElementById('faqs')?.offsetTop || 0
      const contactPosition = document.getElementById('contact')?.offsetTop || 0

      const currentPosition = window.scrollY + window.innerHeight / 3

      if (currentPosition < featuresPosition) {
        setActive('#')
      } else if (currentPosition < appsPosition) {
        setActive('#features')
      } else if (currentPosition < benefitsPosition) {
        setActive('#apps')
      } else if (currentPosition < reviewsPosition) {
        setActive('#benefits')
      } else if (currentPosition < faqsPosition) {
        setActive('#reviews')
      } else if (currentPosition < contactPosition) {
        setActive('#faqs')
      } else {
        setActive('#contact')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={
        isScrolled
          ? 'bg-white shadow fixed w-full z-10 py-2'
          : 'bg-white fixed w-full z-10 py-4'
      }
    >
      <div className="flex items-center justify-between w-[96%] mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#')
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-800">Biz</span>
              <span className="text-2xl font-bold text-yellow-500">Flow</span>
            </div>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div
          className="cursor-pointer lg:hidden"
          onClick={() => setOpen(!open)}
        >
          <Menu className="h-6 w-6 text-gray-800" />
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex items-center space-x-8">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#')
            }}
            className={
              active === '#'
                ? 'font-medium text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer'
                : 'font-medium text-gray-800 hover:text-yellow-500 cursor-pointer'
            }
          >
            HOME
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#features')
            }}
            className={
              active === '#features'
                ? 'font-medium text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer'
                : 'font-medium text-gray-800 hover:text-yellow-500 cursor-pointer'
            }
          >
            FEATURES
          </a>
          <a
            href="#apps"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#apps')
            }}
            className={
              active === '#apps'
                ? 'font-medium text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer'
                : 'font-medium text-gray-800 hover:text-yellow-500 cursor-pointer'
            }
          >
            APPS
          </a>
          <a
            href="#benefits"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#benefits')
            }}
            className={
              active === '#benefits'
                ? 'font-medium text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer'
                : 'font-medium text-gray-800 hover:text-yellow-500 cursor-pointer'
            }
          >
            BENEFITS
          </a>
          <a
            href="#reviews"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#reviews')
            }}
            className={
              active === '#reviews'
                ? 'font-medium text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer'
                : 'font-medium text-gray-800 hover:text-yellow-500 cursor-pointer'
            }
          >
            REVIEWS
          </a>
          <a
            href="#faqs"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#faqs')
            }}
            className={
              active === '#faqs'
                ? 'font-medium text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer'
                : 'font-medium text-gray-800 hover:text-yellow-500 cursor-pointer'
            }
          >
            FAQS
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('#contact')
            }}
            className={
              active === '#contact'
                ? 'font-medium text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer'
                : 'font-medium text-gray-800 hover:text-yellow-500 cursor-pointer'
            }
          >
            CONTACT US
          </a>
        </div>

        {/* Action Buttons - Desktop */}
        <div className="hidden lg:flex items-center space-x-4">
          {userData ? (
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
          ) : (
            <div className="pt-4 border-t">
              <Link
                href="/signup"
                className="block w-full text-center border border-gray-800 text-gray-800 px-4 py-2 rounded mb-2 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                CREATE NEW ACCOUNT
              </Link>
              <Link
                href="/"
                className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors cursor-pointer"
              >
                SIGN IN
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed lg:hidden top-0 ${open ? 'right-0' : '-right-full'} w-3/4 h-full bg-white shadow-lg z-20 transition-all duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">ASSET</span>
              <span className="text-xl font-bold text-yellow-500">TIGER</span>
            </div>
            <div className="cursor-pointer" onClick={() => setOpen(false)}>
              <X className="h-6 w-6 text-gray-800" />
            </div>
          </div>
          <div className="flex flex-col p-4 space-y-4">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#')
                setOpen(false)
              }}
              className={
                active === '#'
                  ? 'text-yellow-500 font-medium cursor-pointer'
                  : 'text-gray-800 font-medium cursor-pointer'
              }
            >
              HOME
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#features')
                setOpen(false)
              }}
              className={
                active === '#features'
                  ? 'text-yellow-500 font-medium cursor-pointer'
                  : 'text-gray-800 font-medium cursor-pointer'
              }
            >
              FEATURES
            </a>
            <a
              href="#apps"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#apps')
                setOpen(false)
              }}
              className={
                active === '#apps'
                  ? 'text-yellow-500 font-medium cursor-pointer'
                  : 'text-gray-800 font-medium cursor-pointer'
              }
            >
              APPS
            </a>
            <a
              href="#benefits"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#benefits')
                setOpen(false)
              }}
              className={
                active === '#benefits'
                  ? 'text-yellow-500 font-medium cursor-pointer'
                  : 'text-gray-800 font-medium cursor-pointer'
              }
            >
              BENEFITS
            </a>
            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#reviews')
                setOpen(false)
              }}
              className={
                active === '#reviews'
                  ? 'text-yellow-500 font-medium cursor-pointer'
                  : 'text-gray-800 font-medium cursor-pointer'
              }
            >
              REVIEWS
            </a>
            <a
              href="#faqs"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#faqs')
                setOpen(false)
              }}
              className={
                active === '#faqs'
                  ? 'text-yellow-500 font-medium cursor-pointer'
                  : 'text-gray-800 font-medium cursor-pointer'
              }
            >
              FAQS
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#contact')
                setOpen(false)
              }}
              className={
                active === '#contact'
                  ? 'text-yellow-500 font-medium cursor-pointer'
                  : 'text-gray-800 font-medium cursor-pointer'
              }
            >
              CONTACT US
            </a>
            {userData ? (
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
            ) : (
              <div className="pt-4 border-t">
                <Link
                  href="/signup"
                  className="block w-full text-center border border-gray-800 text-gray-800 px-4 py-2 rounded mb-2 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  CREATE NEW ACCOUNT
                </Link>
                <Link
                  href="/"
                  className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors cursor-pointer"
                >
                  SIGN IN
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeNavbar
