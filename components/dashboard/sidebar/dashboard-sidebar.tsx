'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, FileChartColumn, Home, NotebookText, Settings, SquarePlus, UserCog } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      title: 'Dashboard Overview',
      icon: Home,
      href: '/dashboard/dashboard-overview',
    },
    {
      title: 'Setup',
      icon: Settings,
      href: '/dashboard/setup',
      subItems: [
        {
          title: 'Items',
          href: '/dashboard/setup/items',
        },
        {
          title: 'Bank Accounts',
          href: '/dashboard/setup/bank-accounts',
        },
        {
          title: 'Vendors',
          href: '/dashboard/setup/vendors',
        },
        {
          title: 'Customers',
          href: '/dashboard/setup/customers',
        },
         {
          title: 'Account Heads',
          href: '/dashboard/setup/account-heads',
        },
        {
          title: 'Purchases',
          href: '/dashboard/setup/purchases',
        },
        {
          title: 'sales',
          href: '/dashboard/setup/sales',
        },
        {
          title: 'Sorting',
          href: '/dashboard/setup/sorting',
        },
      ],
    },
    {
      title: 'Policy',
      icon: NotebookText,
      href: '/dashboard/policy',
      subItems: [
        {
          title: 'Travel Policy',
          href: '/dashboard/policy/travel-policy',
        },
        {
          title: 'Medical & Hospitalization',
          href: '/dashboard/policy/medical-and-hospitalization',
        },
        {
          title: 'Mobile Handset Policy',
          href: '/dashboard/policy/mobile-handset-policy',
        },
      ],
    },
    // {
    //   title: 'Claim',
    //   icon: SquarePlus ,
    //   href: '/dashboard/claim',
    // },
    {
      title: 'Claims',
      icon: SquarePlus,
      href: '/dashboard/claims',
      subItems: [
        {
          title: 'Travel Claim',
          href: '/dashboard/claims/travel-claim',
        },
        {
          title: 'Medical Claim',
          href: '/dashboard/claims/medical-claim',
        },
        {
          title: 'Mobile Handset Claim',
          href: '/dashboard/claims/mobile-handset-claim',
        },
      ],
    },
    {
      title: 'Reports',
      icon: FileChartColumn,
      href: '/dashboard/report',
      subItems: [
        {
          title: 'Birthday Report',
          href: '/dashboard/report/birthday-report',
        },
        {
          title: 'Claim Report',
          href: '/dashboard/report/claim-report',
        },
      ],
    },
  ]

  // Check if the current path is in the submenu items
  const isSubItemActive = (item: any) => {
    if (!item.subItems) return false
    return item.subItems.some((subItem: any) => pathname === subItem.href)
  }

  // Check if the current path matches the main item or its sub-items
  const isItemActive = (item: any) => {
    return pathname.startsWith(item.href) || isSubItemActive(item)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b mt-16">
        <div className="p-2">
          <h1 className="text-xl font-bold">My Dashboard</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {!item.subItems ? (
                    // Regular menu item without submenu
                    <SidebarMenuButton
                      asChild
                      className={`${isItemActive(item) ? 'bg-yellow-400 text-black hover:bg-yellow-400' : ''}  `}
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-2 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    // Menu item with submenu as accordion
                    <Collapsible
                      defaultOpen={isItemActive(item)}
                      className="w-full"
                    >
                      <CollapsibleTrigger className="w-full" asChild>
                        <SidebarMenuButton
                          className={`${isItemActive(item) ? 'bg-yellow-400 text-black hover:bg-yellow-400' : ''}  `}
                        >
                          <item.icon className="mr-2 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={`${pathname === subItem.href ? 'bg-gray-100 text-black' : ''}`}
                              >
                                <Link
                                  className="h-auto mt-2"
                                  href={subItem.href}
                                >
                                  {subItem.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
