export interface TokenData {
  token: string;
  expiresAt: number;
}

export const TOKEN_KEY = 'auth_token';

export const getToken = (): TokenData | null => {
  const tokenData = localStorage.getItem(TOKEN_KEY);
  if (!tokenData) return null;
  
  try {
    const parsed = JSON.parse(tokenData) as TokenData;
    if (parsed.expiresAt < Date.now()) {
      removeToken();
      return null;
    }
    return parsed;
  } catch {
    removeToken();
    return null;
  }
};

export const setToken = (token: string, expiresIn: number): void => {
  const tokenData: TokenData = {
    token,
    expiresAt: Date.now() + expiresIn * 1000
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isTokenValid = (): boolean => {
  const tokenData = getToken();
  return tokenData !== null;
};

export const getAuthHeader = (): { Authorization: string } | {} => {
  const tokenData = getToken();
  return tokenData ? { Authorization: `Bearer ${tokenData.token}` } : {};
}; 