import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

export const surveyService = {
  getSurveys: async () => {
    const response = await api.get('/surveys');
    return response.data;
  },

  getSurvey: async (id: string) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  createSurvey: async (surveyData: any) => {
    const response = await api.post('/surveys', surveyData);
    return response.data;
  },

  updateSurvey: async (id: string, surveyData: any) => {
    const response = await api.put(`/surveys/${id}`, surveyData);
    return response.data;
  },

  deleteSurvey: async (id: string) => {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },

  submitResponse: async (surveyId: string, responses: any) => {
    const response = await api.post(`/surveys/${surveyId}/responses`, responses);
    return response.data;
  },
};

export default api; 