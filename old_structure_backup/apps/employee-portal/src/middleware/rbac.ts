import React from 'react';
import { User, Permission } from '../types/auth';

export const checkPermission = (requiredPermission: Permission) => {
  return (user: User | null): boolean => {
    if (!user) return false;
    
    const role = user.role;
    if (!role) return false;

    // Check if the role has the required permission
    return role.permissions.includes(requiredPermission);
  };
};

export const checkRole = (requiredRole: string) => {
  return (user: User | null): boolean => {
    if (!user) return false;
    return user.role.name === requiredRole;
  };
};

type ComponentWithUser = {
  user: User | null;
  [key: string]: any;
};

export const withPermission = (permission: Permission) => {
  return <P extends ComponentWithUser>(WrappedComponent: React.ComponentType<P>) => {
    const WithPermission = (props: P) => {
      const { user } = props;
      
      if (!checkPermission(permission)(user)) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
              <p className="text-gray-600">
                You don't have permission to access this resource.
              </p>
            </div>
          </div>
        );
      }

      return <WrappedComponent {...props} />;
    };

    return WithPermission;
  };
};

export const withRole = (role: string) => {
  return <P extends ComponentWithUser>(WrappedComponent: React.ComponentType<P>) => {
    const WithRole = (props: P) => {
      const { user } = props;
      
      if (!checkRole(role)(user)) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
              <p className="text-gray-600">
                This resource is only available to {role}s.
              </p>
            </div>
          </div>
        );
      }

      return <WrappedComponent {...props} />;
    };

    return WithRole;
  };
}; 