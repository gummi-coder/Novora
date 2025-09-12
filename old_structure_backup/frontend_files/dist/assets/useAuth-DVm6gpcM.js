import { o as axios, a as reactExports } from "./builder-BipuaEoP.js";
const API_URL = "http://localhost:8000/api/v1";
const authService = {
  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
  async register(data) {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },
  async logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    await axios.post(`${API_URL}/auth/logout`);
  },
  async refreshToken() {
    const response = await axios.post(`${API_URL}/auth/refresh-token`);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },
  async forgotPassword(email) {
    await axios.post(`${API_URL}/auth/forgot-password`, { email });
  },
  async resetPassword(token, password) {
    await axios.post(`${API_URL}/auth/reset-password`, { token, password });
  },
  async verifyEmail(token) {
    await axios.get(`${API_URL}/auth/verify-email/${token}`);
  },
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return {
      id: "1",
      email: "admin@novora.com",
      role: "admin",
      name: "Admin User",
      companyId: "1",
      company_name: "Novora",
      isEmailVerified: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  },
  getToken() {
    return localStorage.getItem("token");
  },
  isAuthenticated() {
    return !!this.getToken();
  }
};
const useAuth = () => {
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);
  const login = reactExports.useCallback(async (email, password) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
    return response;
  }, []);
  const register = reactExports.useCallback(async (data) => {
    const response = await authService.register(data);
    setUser(response.user);
    return response;
  }, []);
  const logout = reactExports.useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);
  const isAuthenticated = reactExports.useCallback(() => {
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
export {
  useAuth as u
};
//# sourceMappingURL=useAuth-DVm6gpcM.js.map
