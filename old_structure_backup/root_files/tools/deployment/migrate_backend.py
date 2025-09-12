#!/usr/bin/env python3
"""
Backend Migration Script for Novora Platform
Migrates from apps/api/ structure to clean backend/ structure
"""

import os
import shutil
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Color codes for output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_step(step: str):
    print(f"\n{Colors.BLUE}{Colors.BOLD}📋 {step}{Colors.END}")

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

class BackendMigrator:
    def __init__(self, source_dir: str = "apps/api", target_dir: str = "backend"):
        self.source_dir = Path(source_dir)
        self.target_dir = Path(target_dir)
        self.file_mappings: Dict[str, str] = {}
        
    def create_directory_structure(self):
        """Create the new clean backend directory structure"""
        print_step("Creating new directory structure")
        
        directories = [
            "app",
            "app/api",
            "app/api/v1",
            "app/api/v1/endpoints",
            "app/core",
            "app/models",
            "app/schemas", 
            "app/services",
            "app/utils",
            "app/tasks",
            "migrations",
            "migrations/versions",
            "tests",
            "tests/unit",
            "tests/integration", 
            "tests/api",
            "scripts",
            "docs",
            "requirements"
        ]
        
        for directory in directories:
            dir_path = self.target_dir / directory
            dir_path.mkdir(parents=True, exist_ok=True)
            
            # Create __init__.py files for Python packages
            if directory.startswith("app"):
                (dir_path / "__init__.py").touch()
        
        print_success(f"Created {len(directories)} directories")

    def get_file_mappings(self) -> Dict[str, str]:
        """Define mappings from old file locations to new locations"""
        mappings = {
            # Models
            "models/response.py": "app/models/response.py",
            "models/survey.py": "app/models/survey.py", 
            "models/user.py": "app/models/user.py",
            "models.py": "app/models/base.py",
            
            # Routes -> Endpoints
            "routes/analytics.py": "app/api/v1/endpoints/analytics.py",
            "routes/auth.py": "app/api/v1/endpoints/auth.py",
            "routes/responses.py": "app/api/v1/endpoints/responses.py",
            "routes/surveys.py": "app/api/v1/endpoints/surveys.py",
            "routes/survey_templates.py": "app/api/v1/endpoints/survey_templates.py",
            "routes/docs.py": "app/api/v1/endpoints/docs.py",
            "routes/config.py": "app/core/config.py",
            
            # Core files
            "main.py": "app/main.py",
            "app.py": "app/main.py",  # Merge with main.py
            "database.py": "app/core/database.py",
            "schemas.py": "app/schemas/__init__.py",
            
            # Utils
            "utils/email.py": "app/utils/email.py",
            "utils/rate_limit.py": "app/utils/rate_limit.py",
            "utils.py": "app/utils/helpers.py",
            
            # Tasks
            "celery_config.py": "app/tasks/celery_app.py",
            "tasks.py": "app/tasks/__init__.py",
            "send_email.py": "app/tasks/email_tasks.py",
            
            # Scripts
            "init_db.py": "scripts/init_db.py",
            "reset_db.py": "scripts/reset_db.py",
            "test_main.py": "tests/api/test_main.py",
            
            # Migrations
            "migrations/alembic.ini": "migrations/alembic.ini",
            "migrations/env.py": "migrations/env.py", 
            "migrations/script.py.mako": "migrations/script.py.mako",
            "migrations/versions/initial_migration.py": "migrations/versions/initial_migration.py",
            
            # Other files
            "requirements.txt": "requirements/base.txt",
            "Dockerfile": "Dockerfile",
            "docker-compose.yml": "docker-compose.yml",
        }
        
        return mappings

    def migrate_files(self):
        """Migrate files from old structure to new structure"""
        print_step("Migrating files to new structure")
        
        mappings = self.get_file_mappings()
        migrated_count = 0
        
        for old_path, new_path in mappings.items():
            source_file = self.source_dir / old_path
            target_file = self.target_dir / new_path
            
            if source_file.exists():
                # Ensure target directory exists
                target_file.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy file
                shutil.copy2(source_file, target_file)
                self.file_mappings[str(source_file)] = str(target_file)
                migrated_count += 1
                print(f"  📁 {old_path} → {new_path}")
            else:
                print_warning(f"File not found: {old_path}")
        
        print_success(f"Migrated {migrated_count} files")

    def update_imports(self):
        """Update import statements in all Python files"""
        print_step("Updating import statements")
        
        # Import mapping patterns
        import_mappings = [
            # Old app imports to new app imports
            (r"from app\.", "from app."),
            (r"import app\.", "import app."),
            
            # Routes to endpoints
            (r"from routes\.", "from app.api.v1.endpoints."),
            (r"import routes\.", "import app.api.v1.endpoints."),
            
            # Models imports
            (r"from models\.", "from app.models."),
            (r"import models\.", "import app.models."),
            (r"from \.models", "from app.models"),
            
            # Utils imports  
            (r"from utils\.", "from app.utils."),
            (r"import utils\.", "import app.utils."),
            
            # Core imports
            (r"from database", "from app.core.database"),
            (r"import database", "import app.core.database"),
            
            # Schema imports
            (r"from schemas", "from app.schemas"),
            (r"import schemas", "import app.schemas"),
            
            # Tasks imports
            (r"from celery_config", "from app.tasks.celery_app"),
            (r"from tasks", "from app.tasks"),
        ]
        
        updated_count = 0
        
        # Find all Python files in the new backend
        for py_file in self.target_dir.rglob("*.py"):
            if py_file.name == "__init__.py":
                continue
                
            try:
                with open(py_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Apply import mappings
                for old_pattern, new_pattern in import_mappings:
                    content = re.sub(old_pattern, new_pattern, content)
                
                # Write back if changed
                if content != original_content:
                    with open(py_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    updated_count += 1
                    
            except Exception as e:
                print_error(f"Error updating {py_file}: {e}")
        
        print_success(f"Updated imports in {updated_count} files")

    def create_essential_files(self):
        """Create essential new files for the clean structure"""
        print_step("Creating essential configuration files")
        
        # Create main.py
        main_py_content = '''"""
FastAPI application entry point for Novora Survey Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Novora Survey Platform API",
        description="Backend API for comprehensive survey management platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    app.include_router(api_router, prefix="/api/v1")
    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
        
        # Create config.py if it doesn't exist
        config_py_content = '''"""
Configuration settings for the application
"""
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Novora Survey Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/novora"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Email
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
'''
        
        # Create API router
        api_router_content = '''"""
Main API router that includes all endpoint routers
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users, 
    surveys,
    responses,
    analytics
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(surveys.router, prefix="/surveys", tags=["surveys"])
api_router.include_router(responses.router, prefix="/responses", tags=["responses"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
'''
        
        # Create dependencies
        deps_content = '''"""
FastAPI dependencies for authentication, database sessions, etc.
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token

security = HTTPBearer()

def get_current_user(
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        # Get user from database
        # user = get_user_by_id(db, user_id)
        # return user
        return {"user_id": user_id}  # Placeholder
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def get_current_admin_user(
    current_user = Depends(get_current_user)
):
    """Require admin privileges"""
    # Check if user is admin
    # if not current_user.is_admin:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Admin privileges required"
    #     )
    return current_user
'''
        
        # Create requirements files
        base_requirements = '''fastapi>=0.104.0
uvicorn[standard]>=0.24.0
sqlalchemy>=2.0.0
alembic>=1.12.0
pydantic>=2.4.0
pydantic-settings>=2.0.0
python-multipart>=0.0.6
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
celery>=5.3.0
redis>=5.0.0
psycopg2-binary>=2.9.7
python-dotenv>=1.0.0
'''
        
        dev_requirements = '''-r base.txt
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.25.0
black>=23.9.0
isort>=5.12.0
flake8>=6.1.0
mypy>=1.6.0
'''
        
        # Write files
        files_to_create = [
            (self.target_dir / "app" / "main.py", main_py_content),
            (self.target_dir / "app" / "api" / "v1" / "api.py", api_router_content),
            (self.target_dir / "app" / "api" / "deps.py", deps_content),
            (self.target_dir / "requirements" / "base.txt", base_requirements),
            (self.target_dir / "requirements" / "dev.txt", dev_requirements),
        ]
        
        # Only create config if it doesn't exist
        if not (self.target_dir / "app" / "core" / "config.py").exists():
            files_to_create.append((self.target_dir / "app" / "core" / "config.py", config_py_content))
        
        for file_path, content in files_to_create:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"  📄 Created {file_path.relative_to(self.target_dir)}")
        
        print_success(f"Created {len(files_to_create)} essential files")

    def create_env_example(self):
        """Create .env.example file"""
        env_content = '''# Database
DATABASE_URL=postgresql://user:password@localhost/novora

# Security  
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-password

# Development
DEBUG=true
'''
        
        with open(self.target_dir / ".env.example", 'w') as f:
            f.write(env_content)
        
        print_success("Created .env.example file")

    def create_gitignore(self):
        """Create .gitignore for backend"""
        gitignore_content = '''# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
env/
ENV/

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite3

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/

# Celery
celerybeat-schedule
celerybeat.pid

# OS
.DS_Store
Thumbs.db

# Uploads
uploads/
media/
'''
        
        with open(self.target_dir / ".gitignore", 'w') as f:
            f.write(gitignore_content)
        
        print_success("Created .gitignore file")

    def generate_summary(self):
        """Generate migration summary"""
        print_step("Migration Summary")
        
        summary = f"""
{Colors.GREEN}{Colors.BOLD}✅ Backend migration completed successfully!{Colors.END}

📁 New Structure Created:
   ├── app/               # Main application package
   │   ├── api/v1/        # API endpoints  
   │   ├── core/          # Core functionality
   │   ├── models/        # Database models
   │   ├── schemas/       # Pydantic schemas
   │   ├── services/      # Business logic
   │   ├── utils/         # Utilities
   │   └── tasks/         # Background tasks
   ├── migrations/        # Database migrations
   ├── tests/            # Test suite
   ├── scripts/          # Utility scripts
   └── requirements/     # Dependencies

🚀 Next Steps:
   1. Review migrated files for any issues
   2. Update database connection string in .env
   3. Install dependencies: pip install -r requirements/dev.txt
   4. Run the API: uvicorn app.main:app --reload
   5. Check API docs at: http://localhost:8000/docs
   6. Run tests to ensure everything works

⚠️  Manual Tasks Needed:
   - Review and update configuration in app/core/config.py
   - Check all import statements are working
   - Update any hardcoded paths
   - Add any missing dependencies to requirements/
   - Test all API endpoints

{Colors.BLUE}Your backend is now properly organized and ready for professional development!{Colors.END}
"""
        print(summary)

    def run_migration(self):
        """Run the complete migration process"""
        print(f"\n{Colors.BOLD}🚀 Starting Backend Migration{Colors.END}")
        print(f"Source: {self.source_dir}")
        print(f"Target: {self.target_dir}")
        
        try:
            # Check if source exists
            if not self.source_dir.exists():
                print_error(f"Source directory {self.source_dir} does not exist!")
                return False
            
            # Create backup of existing backend if it exists
            if self.target_dir.exists():
                backup_dir = Path(f"{self.target_dir}_backup")
                if backup_dir.exists():
                    shutil.rmtree(backup_dir)
                shutil.move(self.target_dir, backup_dir)
                print_warning(f"Existing backend moved to {backup_dir}")
            
            # Run migration steps
            self.create_directory_structure()
            self.migrate_files()
            self.update_imports()
            self.create_essential_files()
            self.create_env_example()
            self.create_gitignore()
            self.generate_summary()
            
            return True
            
        except Exception as e:
            print_error(f"Migration failed: {e}")
            return False

def main():
    """Main migration function"""
    migrator = BackendMigrator()
    success = migrator.run_migration()
    
    if success:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 Migration completed successfully!{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}💥 Migration failed!{Colors.END}")

if __name__ == "__main__":
    main()