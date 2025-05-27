import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBranding } from '@/contexts/BrandingContext';
import {
  BarChart3,
  FileText,
  Settings,
  Users,
  LayoutDashboard,
  Server,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    name: 'Infrastructure',
    href: '/infrastructure',
    icon: Server,
  },
  {
    name: 'Compliance',
    href: '/compliance',
    icon: Shield,
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { settings } = useBranding();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-[60px] items-center border-b px-6">
        {settings.logo ? (
          <img src={settings.logo} alt={settings.companyName} className="h-8 w-auto" />
        ) : (
          <span className="text-lg font-semibold">{settings.companyName}</span>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navigation.map((item) => (
            <Button
              key={item.name}
              asChild
              variant={location.pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                location.pathname === item.href && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
              )}
            >
              <Link to={item.href}>
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
} 