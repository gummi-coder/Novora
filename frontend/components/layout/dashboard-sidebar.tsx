"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Settings,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Billing & Plans', href: '/dashboard/billing', icon: DollarSign },
  { name: 'System Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
  { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
  { name: 'Engagement', href: '/dashboard/engagement', icon: TrendingUp },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-semibold text-gray-900">novora</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-medium text-sm">D</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Demo Admin</p>
            <p className="text-xs text-gray-500 truncate">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}