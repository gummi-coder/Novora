// Mock users service
export const mockUserService = {
  getUsers: async () => {
    return [
      {
        id: 1,
        email: 'employee1@company.com',
        name: 'John Doe',
        department: 'Engineering',
        status: 'active'
      },
      {
        id: 2,
        email: 'employee2@company.com',
        name: 'Jane Smith',
        department: 'Marketing',
        status: 'active'
      }
    ];
  },
  
  getEmployees: async () => {
    return [
      {
        id: 1,
        email: 'employee1@company.com',
        name: 'John Doe',
        department: 'Engineering',
        team: 'Frontend',
        status: 'active'
      },
      {
        id: 2,
        email: 'employee2@company.com',
        name: 'Jane Smith',
        department: 'Marketing',
        team: 'Digital',
        status: 'active'
      }
    ];
  }
};
