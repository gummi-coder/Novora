const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const api = {
  // Health check
  healthCheck: () => fetch(`${API_BASE}/health`).then(res => res.json()),
  
  // Users
  getUsers: () => fetch(`${API_BASE}/users`).then(res => res.json()),
  createUser: (userData: unknown) => 
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(res => res.json()),
  
  // Companies
  getCompanies: () => fetch(`${API_BASE}/companies`).then(res => res.json()),
};