# 🚀 Novora - Employee Engagement Platform

A comprehensive employee survey and engagement platform with role-based access control, advanced analytics, and automated insights.

## 🎯 **What is Novora?**

Novora is a modern employee engagement platform that helps organizations:
- **Create and distribute surveys** with advanced question types
- **Analyze responses** with real-time dashboards and insights
- **Manage teams** with role-based access control
- **Automate engagement** with auto-pilot features
- **Integrate seamlessly** with existing HR systems

## 📁 **Project Structure**

```
Novora/
├── 📁 frontend/           # React + Vite frontend
├── 📁 backend/            # FastAPI backend
├── 📁 docs/               # All documentation
│   ├── 📁 implementation/ # Feature implementation docs
│   ├── 📁 status/         # Project status docs
│   └── 📁 setup/          # Setup and configuration docs
├── 📁 tools/              # Development and deployment tools
│   ├── 📁 deployment/     # Deployment scripts
│   ├── 📁 testing/        # Test scripts
│   └── 📁 feature-flags/  # Feature flag testing
└── 📁 old_structure_backup/ # Legacy code backup
```

📋 **See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed organization**

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v18+)
- Python (v3.11+)
- PostgreSQL or SQLite

### **Development Setup**
```bash
# Clone the repository
git clone <repository-url>
cd Novora

# Start development servers
./tools/deployment/start_localhost.sh
```

### **MVP Deployment**
```bash
# Deploy MVP version (core features only)
./tools/deployment/deploy-mvp.sh
```

## 🎯 **Key Features**

### **Core Features** ✅
- **Survey Creation & Management** - Build surveys with templates
- **Response Collection** - Real-time survey responses
- **Dashboard Analytics** - Visual insights and trends
- **Role-Based Access** - Admin, Manager, Employee roles
- **Alert System** - Automated notifications
- **ENPS Integration** - Employee Net Promoter Score

### **Advanced Features** 🚀
- **Photo-Based Surveys** - Visual question types
- **Auto-Pilot** - Automated survey scheduling
- **Advanced Analytics** - Predictive insights
- **Integrations** - Slack, Teams, HRIS systems
- **Export & Reporting** - Custom reports and exports

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching

### **Backend**
- **FastAPI** with Python
- **SQLAlchemy** ORM
- **Alembic** for migrations
- **Celery** for background tasks
- **Redis** for caching

## 📚 **Documentation**

- **[MVP Setup](docs/MVP_SETUP.md)** - Deploy core features only
- **[Engineering Deliverables](docs/ENGINEERING_DELIVERABLES.md)** - Technical specifications
- **[QA Checklist](docs/QA_CHECKLIST.md)** - Quality assurance guide
- **[Project Status](docs/status/)** - Current implementation status

## 🧪 **Testing**

```bash
# Run MVP smoke test
python3 tools/testing/mvp-smoke-test.py

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && python -m pytest
```

## 🚀 **Deployment**

### **Development**
```bash
./tools/deployment/start_localhost.sh
```

### **Production**
```bash
# Build and deploy
./tools/deployment/deploy-mvp.sh
```

### **Environment Configuration**
- Copy `.env.example` to `.env`
- Configure database, API keys, and integrations
- Set feature flags for MVP vs full deployment

## 🎯 **Access Control**

### **Admin Role** 🔑
- Full survey creation and management
- Complete employee directory access
- Company-wide analytics and reports
- System configuration and settings

### **Manager Role** 👥
- Read-only survey visibility
- Team-scoped data access
- Basic team exports
- Personal settings only

### **Employee Role** 👤
- Survey participation
- Response submission
- Personal dashboard
- Progress tracking

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **Documentation**: Check the `docs/` directory
- **Issues**: Create an issue in the repository
- **Questions**: Contact the development team

---

**Built with ❤️ for better employee engagement** 