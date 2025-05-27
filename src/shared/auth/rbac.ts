export type Role = 'admin' | 'user' | 'guest';

export const hasPermission = (userRole: Role, requiredRole: Role): boolean => {
  const roleHierarchy: Record<Role, number> = {
    admin: 3,
    user: 2,
    guest: 1
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const checkAccess = (userRole: Role, requiredRole: Role): void => {
  if (!hasPermission(userRole, requiredRole)) {
    throw new Error('Access denied: Insufficient permissions');
  }
}; 