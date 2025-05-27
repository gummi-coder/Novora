export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  // Add token validation logic here (e.g., JWT decode and expiry check)
  return true;
}; 