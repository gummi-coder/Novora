// API Configuration
window.API_CONFIG = {
  // Your actual Render backend URL
  BASE_URL: 'https://novora.onrender.com',
  
  // Frontend URL for survey links
  FRONTEND_URL: 'https://novorasurveys.com',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: '/api/v1/auth',
    SURVEYS: '/api/v1/surveys',
    RESPONSES: '/api/v1/responses',
    HEALTH: '/api/v1/health'
  }
};

// Override hardcoded localhost URLs
window.ENVIRONMENT_CONFIG = {
  VITE_API_URL: 'https://novora.onrender.com',
  VITE_FRONTEND_URL: 'https://novorasurveys.com',
  NODE_ENV: 'production'
};

// Make it globally available
if (typeof window !== 'undefined') {
  window.API_CONFIG = window.API_CONFIG;
  window.ENVIRONMENT_CONFIG = window.ENVIRONMENT_CONFIG;
}