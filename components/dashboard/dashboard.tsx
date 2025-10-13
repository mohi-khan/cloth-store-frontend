"use client"

import { tokenAtom, useInitializeUser, userDataAtom } from "@/utils/user"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
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
  const [activeComponent, setActiveComponent] = useState(1)

  const Component1 = () => (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-green-500 text-sm mt-1">↑ 12% from last month</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-700">Revenue</h3>
          <p className="text-3xl font-bold mt-2">$34,567</p>
          <p className="text-green-500 text-sm mt-1">↑ 8% from last month</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-700">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">27</p>
          <p className="text-red-500 text-sm mt-1">↓ 3% from last month</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-700">Tasks Completed</h3>
          <p className="text-3xl font-bold mt-2">189</p>
          <p className="text-green-500 text-sm mt-1">↑ 24% from last month</p>
        </div>
      </div>
    </div>
  )

  const Component2 = () => (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <div className="h-64 bg-gray-50 rounded-lg border flex items-center justify-center">
        <p className="text-gray-500">Analytics chart would go here</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg border">
          <h3 className="font-medium text-gray-700">Page Views</h3>
          <p className="text-xl font-bold mt-1">45,678</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border">
          <h3 className="font-medium text-gray-700">Bounce Rate</h3>
          <p className="text-xl font-bold mt-1">32.4%</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border">
          <h3 className="font-medium text-gray-700">Avg. Session</h3>
          <p className="text-xl font-bold mt-1">4m 23s</p>
        </div>
      </div>
    </div>
  )

  const Component3 = () => (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 text-left">Project Name</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-left">Deadline</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">Website Redesign</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
              </td>
              <td className="py-3 px-4">Design Team</td>
              <td className="py-3 px-4">Dec 24, 2023</td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">Mobile App Development</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">In Progress</span>
              </td>
              <td className="py-3 px-4">Dev Team</td>
              <td className="py-3 px-4">Jan 15, 2024</td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">Marketing Campaign</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Planning</span>
              </td>
              <td className="py-3 px-4">Marketing</td>
              <td className="py-3 px-4">Feb 1, 2024</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4">Product Launch</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Upcoming</span>
              </td>
              <td className="py-3 px-4">All Teams</td>
              <td className="py-3 px-4">Mar 10, 2024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  const Component4 = () => (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-lg">Account Settings</h3>
          <div className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                <div className="w-6 h-6 bg-yellow-400 rounded-full absolute left-0 shadow"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Two-Factor Authentication</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                <div className="w-6 h-6 bg-gray-400 rounded-full absolute right-0 shadow"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-lg">Theme Preferences</h3>
          <div className="mt-2 flex gap-2">
            <button className="w-8 h-8 bg-white border-2 border-yellow-400 rounded-full"></button>
            <button className="w-8 h-8 bg-gray-800 rounded-full"></button>
            <button className="w-8 h-8 bg-yellow-500 rounded-full"></button>
            <button className="w-8 h-8 bg-green-500 rounded-full"></button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveComponent(1)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeComponent === 1 ? "bg-yellow-400 text-white" : "hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">📊</span>
                Dashboard Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveComponent(2)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeComponent === 2 ? "bg-yellow-400 text-white" : "hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">📈</span>
                Analytics
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveComponent(3)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeComponent === 3 ? "bg-yellow-400 text-white" : "hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">📁</span>
                Projects
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveComponent(4)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                  activeComponent === 4 ? "bg-yellow-400 text-white" : "hover:bg-gray-100"
                }`}
              >
                <span className="mr-3">⚙️</span>
                Settings
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {activeComponent === 1 && <Component1 />}
        {activeComponent === 2 && <Component2 />}
        {activeComponent === 3 && <Component3 />}
        {activeComponent === 4 && <Component4 />}
      </div>
    </div>
  )
}

