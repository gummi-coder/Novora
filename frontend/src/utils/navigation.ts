// Navigation utility for route management and breadcrumbs

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  description?: string;
  icon?: string;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

// Get current section from URL path
export const getCurrentSection = (pathname: string): string => {
  if (pathname === '/dashboard' || pathname === '/dashboard/overview') {
    return 'overview';
  }
  const section = pathname.replace('/dashboard/', '');
  return section || 'overview';
};

// Get page title based on current route
export const getPageTitle = (pathname: string, userRole?: string): string => {
  const section = getCurrentSection(pathname);
  
  const titles: Record<string, string> = {
    overview: 'Dashboard',
    trends: 'Trends',
    feedback: 'Feedback',
    reports: 'Reports',
    settings: 'Settings',
    'culture-trends': 'Culture Trends',
    departments: 'Departments',
    'adoption-usage': 'Adoption & Usage',
    'admin-activity': 'Admin Activity',
    'team-trends': 'Team Trends',
    alerts: 'Alerts',
    employees: 'Employees',
    surveys: 'Surveys',
    'auto-pilot': 'Auto-Pilot',
    'my-teams': 'My Teams',
  };

  const baseTitle = titles[section] || 'Dashboard';
  
  if (userRole === 'admin') {
    return `Admin ${baseTitle}`;
  } else if (userRole === 'owner') {
    return `Owner ${baseTitle}`;
  }
  
  return baseTitle;
};

// Generate breadcrumbs for current route
export const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      isActive: pathname === '/dashboard' || pathname === '/dashboard/overview'
    }
  ];

  const section = getCurrentSection(pathname);
  
  if (section !== 'overview') {
    const sectionTitles: Record<string, string> = {
      trends: 'Trends',
      feedback: 'Feedback',
      reports: 'Reports',
      settings: 'Settings',
      'culture-trends': 'Culture Trends',
      departments: 'Departments',
      'adoption-usage': 'Adoption & Usage',
      'admin-activity': 'Admin Activity',
      'team-trends': 'Team Trends',
      alerts: 'Alerts',
      employees: 'Employees',
      surveys: 'Surveys',
      'auto-pilot': 'Auto-Pilot',
      'my-teams': 'My Teams',
    };

    breadcrumbs.push({
      label: sectionTitles[section] || section,
      path: `/dashboard/${section}`,
      isActive: true
    });
  }

  return breadcrumbs;
};

// Check if a route is active
export const isActiveRoute = (pathname: string, routeId: string): boolean => {
  if (routeId === 'overview') {
    return pathname === '/dashboard' || pathname === '/dashboard/overview';
  }
  return pathname === `/dashboard/${routeId}`;
};

// Get navigation path for a route
export const getNavigationPath = (routeId: string): string => {
  if (routeId === 'overview') {
    return '/dashboard';
  }
  return `/dashboard/${routeId}`;
};

// User navigation items (for regular users)
export const getUserNavigationItems = (): NavigationItem[] => [
  {
    id: 'overview',
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Overview & Analytics'
  },
  {
    id: 'trends',
    label: 'Trends',
    path: '/dashboard/trends',
    description: 'Trend Analysis & Predictions'
  },
  {
    id: 'feedback',
    label: 'Feedback',
    path: '/dashboard/feedback',
    description: 'Comments & Suggestions'
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/dashboard/reports',
    description: 'Analytics & Exports'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    description: 'Configuration & Preferences'
  },
];

// Owner navigation items
export const getOwnerNavigationItems = (): NavigationItem[] => [
  {
    id: 'overview',
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Executive Overview'
  },
  {
    id: 'culture-trends',
    label: 'Culture Trends',
    path: '/dashboard/culture-trends',
    description: 'Organizational Culture Insights'
  },
  {
    id: 'departments',
    label: 'Departments',
    path: '/dashboard/departments',
    description: 'Department Performance & Health'
  },
  {
    id: 'adoption-usage',
    label: 'Adoption & Usage',
    path: '/dashboard/adoption-usage',
    description: 'Platform Adoption Metrics'
  },
  {
    id: 'admin-activity',
    label: 'Admin Activity',
    path: '/dashboard/admin-activity',
    description: 'Administrative Actions & Logs'
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/dashboard/reports',
    description: 'Executive Reports & Analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    description: 'System Configuration'
  },
];

// Admin navigation items
export const getAdminNavigationItems = (): NavigationItem[] => [
  {
    id: 'overview',
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Admin Overview'
  },
  {
    id: 'team-trends',
    label: 'Team Trends',
    path: '/dashboard/team-trends',
    description: 'Team Performance Trends'
  },
  {
    id: 'feedback',
    label: 'Feedback',
    path: '/dashboard/feedback',
    description: 'Employee Feedback Management'
  },
  {
    id: 'alerts',
    label: 'Alerts',
    path: '/dashboard/alerts',
    description: 'System Alerts & Notifications'
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/dashboard/employees',
    description: 'Employee Management'
  },
  {
    id: 'surveys',
    label: 'Surveys',
    path: '/dashboard/surveys',
    description: 'Survey Management'
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/dashboard/reports',
    description: 'Analytics & Reports'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    description: 'System Settings'
  },
];

// Get navigation items based on user role
export const getNavigationItems = (userRole: string): NavigationItem[] => {
  if (userRole === 'admin') {
    return getAdminNavigationItems();
  } else if (userRole === 'owner') {
    return getOwnerNavigationItems();
  } else {
    return getUserNavigationItems();
  }
};
