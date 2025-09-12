# 🪄 Unified Dashboard

## Overview

The Unified Dashboard is a simplified, role-based dashboard that adapts its content and functionality based on the user's role. Instead of having separate dashboards for different user types, everyone logs into the same interface, but sees different content based on their permissions.

## 🎯 Benefits

- **Simplified UX**: One interface to learn and master
- **Role-Based Access**: Same tabs, different content depth
- **Reduced Complexity**: From 16+ sections to 6-7 core tabs
- **Better Adoption**: Easier onboarding for new users
- **Consistent Experience**: Same navigation patterns for everyone
- **Easier Maintenance**: One codebase to maintain

## 👥 Role-Based Access

### Admin Role (Full Access)
- **Overview**: All teams, all data
- **Team Trends**: All teams performance trends
- **Feedback**: All employee feedback
- **Alerts**: All system alerts
- **Employees**: All employees + managers
- **Surveys**: All surveys + auto-pilot management
- **Reports**: Full reporting capabilities
- **Settings**: Organization settings + user management

### Manager Role
- **Overview**: Their team only
- **Team Trends**: Their team performance over time
- **Feedback**: Comments from their team
- **Alerts**: Team-specific alerts
- **Employees**: Their team members only
- **Surveys**: Team surveys only (read-only status)
- **Reports**: Export for their team only
- **Settings**: Personal settings only

## 🏗️ Implementation

### Core Component
- `UnifiedDashboard.tsx`: Main dashboard component with role-based filtering

### Key Features
- **Role Detection**: Automatically detects user role from auth context
- **Conditional Rendering**: Shows different content based on role
- **Data Filtering**: Fetches appropriate data scope for each role
- **Navigation**: Same tabs, different content depth
- **Actions**: Role-appropriate actions (e.g., only admins can create surveys)

### Data Flow
1. User logs in → Role detected from auth context
2. Dashboard loads → Fetches data appropriate for user role
3. Content renders → Shows filtered/appropriate content
4. Actions available → Only shows actions user can perform

## 🔧 Technical Details

### Role-Based Logic
```typescript
const isManager = user?.role === 'manager';
const isOwnerOrAdmin = user?.role === 'admin';

// Conditional rendering based on role
{isOwnerOrAdmin && (
  <Button>Create Survey</Button>
)}
```

### Data Fetching
- **Manager**: Fetches only their team data
- **Admin/Owner**: Fetches all organization data
- **Mock Data**: Currently uses mock data for demonstration

### Navigation Tabs
All users see the same 8 tabs:
1. Overview
2. Team Trends
3. Feedback
4. Alerts
5. Employees
6. Surveys
7. Reports
8. Settings

## 🚀 Future Enhancements

### Planned Features
- [ ] Real API integration for data fetching
- [ ] Advanced filtering and search
- [ ] Customizable dashboard layouts
- [ ] Role-based permissions system
- [ ] Audit logging for admin actions

### Potential Improvements
- [ ] Drag-and-drop dashboard customization
- [ ] Role-based widget availability
- [ ] Advanced analytics for different roles
- [ ] Mobile-responsive design improvements

## 📝 Usage

### For Developers
1. The dashboard automatically adapts based on user role
2. Add new features by checking role permissions
3. Use the `isManager` and `isOwnerOrAdmin` flags for conditional rendering

### For Users
1. **Admin**: Full access to all features and data
2. **Manager**: Limited to their team's data and actions

## 🔐 Security

- Role-based access control at the component level
- Data filtering based on user permissions
- Action availability controlled by role checks
- Future: Backend API endpoints will enforce role-based access

## 📊 Test Accounts

### Admin Account (Full Access)
- Email: `admin@novora.com`
- Password: `admin123`
- Role: `admin`

### Manager Account (Limited Access)
- Email: `manager@novora.com`
- Password: `manager123`
- Role: `manager`
