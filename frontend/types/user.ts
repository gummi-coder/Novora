export interface User {
  id: string;
  name: string;
  email: string;
  company: {
    id: string;
    name: string;
  };
  role: 'Admin' | 'User';
  status: 'Active' | 'Inactive' | 'Pending';
  lastActive: string;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
}