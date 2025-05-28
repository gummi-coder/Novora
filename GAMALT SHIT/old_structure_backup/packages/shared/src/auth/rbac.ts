export type Role = 'admin' | 'user' | 'guest';

export interface Permission {
  action: string;
  resource: string;
}

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { action: 'manage', resource: 'all' }
  ],
  user: [
    { action: 'read', resource: 'dashboard' },
    { action: 'write', resource: 'dashboard' },
    { action: 'read', resource: 'profile' },
    { action: 'write', resource: 'profile' }
  ],
  guest: [
    { action: 'read', resource: 'public' }
  ]
};

export const hasPermission = (userRole: Role, requiredAction: string, requiredResource: string): boolean => {
  const permissions = rolePermissions[userRole];
  if (!permissions) return false;

  return permissions.some(
    permission =>
      (permission.action === requiredAction || permission.action === 'manage') &&
      (permission.resource === requiredResource || permission.resource === 'all')
  );
};

export const checkAccess = (userRole: Role, requiredAction: string, requiredResource: string): void => {
  if (!hasPermission(userRole, requiredAction, requiredResource)) {
    throw new Error(`Access denied: ${userRole} cannot ${requiredAction} ${requiredResource}`);
  }
};

export const getRoleHierarchy = (): Record<Role, number> => ({
  admin: 3,
  user: 2,
  guest: 1
});

export const hasHigherRole = (userRole: Role, requiredRole: Role): boolean => {
  const hierarchy = getRoleHierarchy();
  return hierarchy[userRole] >= hierarchy[requiredRole];
}; 