"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, Check, X, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/types/user"

// Mock data matching your screenshot
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@acmeinc.com",
    company: { id: "1", name: "Acme Inc." },
    role: "Admin",
    status: "Active",
    lastActive: "10/28/2023, 3:23:42 PM",
  },
  {
    id: "2", 
    name: "Jane Smith",
    email: "jane.smith@techcorp.com",
    company: { id: "2", name: "TechCorp" },
    role: "User",
    status: "Active", 
    lastActive: "10/28/2023, 9:15:10 AM",
  },
  {
    id: "3",
    name: "Mike Johnson", 
    email: "mike.j@globaltech.com",
    company: { id: "3", name: "GlobalTech" },
    role: "Admin",
    status: "Inactive",
    lastActive: "10/15/2023, 11:30:45 AM",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@acmeinc.com", 
    company: { id: "1", name: "Acme Inc." },
    role: "User",
    status: "Active",
    lastActive: "10/27/2023, 4:42:12 PM",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.b@innovateco.com",
    company: { id: "4", name: "InnovateCo" },
    role: "Admin", 
    status: "Pending",
    lastActive: "Never",
  },
  {
    id: "6",
    name: "Lisa Chen",
    email: "lisa.c@futuretech.com",
    company: { id: "5", name: "FutureTech" },
    role: "User",
    status: "Active", 
    lastActive: "10/28/2023, 10:05:32 AM",
  },
]

function StatusIcon({ status }: { status: User['status'] }) {
  switch (status) {
    case 'Active':
      return <Check className="h-4 w-4 text-green-600" />
    case 'Inactive':
      return <X className="h-4 w-4 text-red-600" />
    case 'Pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    default:
      return null
  }
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
  return (
    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
      <span className="text-blue-600 font-medium text-sm">{initials}</span>
    </div>
  )
}

export function UserTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all") 
  const [companyFilter, setCompanyFilter] = useState("all")

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter
    const matchesCompany = companyFilter === "all" || user.company.name === companyFilter

    return matchesSearch && matchesRole && matchesStatus && matchesCompany
  })

  const companies = Array.from(new Set(mockUsers.map(u => u.company.name)))
  
  // Statistics
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.status === 'Active').length
  const adminUsers = mockUsers.filter(u => u.role === 'Admin').length
  const regularUsers = mockUsers.filter(u => u.role === 'User').length

  // Recent activity
  const recentActivity = [
    { user: "John Doe", company: "Acme Inc.", action: "Last active:", time: "10/28/2023, 3:23:42 PM" },
    { user: "Lisa Chen", company: "FutureTech", action: "Last active:", time: "10/28/2023, 10:05:32 AM" },
    { user: "Jane Smith", company: "TechCorp", action: "Last active:", time: "10/28/2023, 9:15:10 AM" },
  ]

  // Users needing attention  
  const usersNeedingAttention = [
    { user: "Mike Johnson", issue: "Inactive for 13 days", action: "Contact" },
    { user: "David Brown", issue: "Pending activation", action: "Remind" },
  ]

  return (
    <div className="space-y-6">
      {/* Header and controls */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-72"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(company => (
                <SelectItem key={company} value={company}>{company}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <UserAvatar name={user.name} />
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <span className="text-sm">{user.company.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Admin' ? 'admin' : 'user'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <StatusIcon status={user.status} />
                    <span className="text-sm">{user.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {user.lastActive}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bottom statistics and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Statistics */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-medium text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="font-medium">{totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="font-medium">{activeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Admins</span>
              <span className="font-medium">{adminUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Regular Users</span>
              <span className="font-medium">{regularUsers}</span>
            </div>
          </div>
        </div>

        {/* Recent User Activity */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-medium text-gray-900 mb-4">Recent User Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-gray-900">{activity.user}</div>
                <div className="text-gray-500">{activity.company}</div>
                <div className="text-gray-600">
                  {activity.action} {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Needing Attention */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-medium text-gray-900 mb-4">Users Needing Attention</h3>
          <div className="space-y-3">
            {usersNeedingAttention.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{item.user}</div>
                  <div className="text-gray-500 text-xs">{item.issue}</div>
                </div>
                <Button variant="outline" size="sm">
                  {item.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}