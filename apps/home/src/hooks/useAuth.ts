import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { User } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
    return response;
  }, []);

  const register = useCallback(async (data: any) => {
    const response = await authService.register(data);
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: isAuthenticated()
  };
}; 