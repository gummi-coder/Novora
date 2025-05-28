"use client"

import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">D</span>
            </div>
            <span className="text-sm font-medium">Demo Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}