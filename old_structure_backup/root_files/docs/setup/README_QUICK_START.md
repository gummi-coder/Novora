# Novora Survey Platform - Quick Start Guide

## 🚀 **Ready to Launch!**

All configuration files have been created and the platform is ready to run.

### **Quick Start (Recommended)**

```bash
# Navigate to the project root
cd "Novora"

# Start both servers with one command
./start-servers.sh
```

### **Manual Start**

#### **Frontend (React/Vite)**
```bash
cd frontend
npm run dev
# Access at: http://localhost:3000
```

#### **Backend (FastAPI)**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Access at: http://localhost:8000
# API Docs at: http://localhost:8000/docs
```

### **What's Been Set Up** ✅

#### **Configuration Files Created:**
- ✅ `backend/nginx.conf` - Reverse proxy with SSL
- ✅ `backend/ssl/cert.pem` & `key.pem` - SSL certificates
- ✅ `backend/.env` - Backend environment with secure secrets
- ✅ `frontend/.env.development` - Frontend development config
- ✅ `frontend/.env.staging` - Frontend staging config
- ✅ `frontend/.env.production` - Frontend production config

#### **Dependencies Installed:**
- ✅ **Frontend**: All missing packages (sonner, react-query, etc.)
- ✅ **Backend**: psutil and all monitoring dependencies
- ✅ **TailwindCSS**: v4 compatible configuration

#### **Security Configured:**
- ✅ **SSL Certificates**: Self-signed for development
- ✅ **Secure Secrets**: JWT, database, and Redis passwords
- ✅ **Rate Limiting**: Configured in nginx
- ✅ **Security Headers**: Implemented

### **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| Health Check | http://localhost:8000/health | System health status |

### **Development Features**

#### **Frontend:**
- ✅ Hot reload enabled
- ✅ TypeScript compilation
- ✅ TailwindCSS styling
- ✅ React Query for data fetching
- ✅ Toast notifications
- ✅ Theme management

#### **Backend:**
- ✅ Auto-reload on code changes
- ✅ Comprehensive API documentation
- ✅ Health monitoring
- ✅ SSL support
- ✅ Database migrations
- ✅ Background task processing

### **Troubleshooting**

#### **If servers don't start:**

1. **Check ports are available:**
   ```bash
   lsof -i :3000  # Check frontend port
   lsof -i :8000  # Check backend port
   ```

2. **Verify dependencies:**
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd backend && source venv/bin/activate && pip install -r requirements/base.txt
   ```

3. **Check configuration:**
   ```bash
   # Test backend
   cd backend && source venv/bin/activate
   python -c "from app.main import app; print('✅ Backend OK')"
   
   # Test frontend
   cd frontend && npm run build
   ```

#### **Common Issues:**

- **Port already in use**: Kill existing processes or change ports
- **SSL certificate warnings**: Normal for self-signed certificates in development
- **Database errors**: SQLite file will be created automatically

### **Next Steps**

#### **For Development:**
1. Start the servers using `./start-servers.sh`
2. Access the application at http://localhost:3000
3. Explore the API documentation at http://localhost:8000/docs
4. Begin development!

#### **For Production:**
1. Replace SSL certificates with proper certificates
2. Update environment variables for production
3. Set up PostgreSQL database
4. Configure monitoring and logging
5. Deploy using Docker Compose

### **Project Structure**

```
Novora/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   ├── ssl/                # SSL certificates
│   ├── nginx.conf          # Nginx configuration
│   ├── .env                # Environment variables
│   └── novora.db           # SQLite database
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── .env.development    # Development config
│   ├── .env.staging        # Staging config
│   └── .env.production     # Production config
├── start-servers.sh        # Quick start script
├── setup-configuration.sh  # Configuration setup
└── README_QUICK_START.md   # This file
```

### **Support**

- **Documentation**: Check the `docs/` directory
- **API Reference**: http://localhost:8000/docs
- **Configuration**: See `CONFIGURATION_STATUS.md`
- **Dependencies**: See `DEPENDENCY_STATUS.md`

---

**🎉 You're all set! The Novora Survey Platform is ready to run.**

**Start with:** `./start-servers.sh`
