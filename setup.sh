#!/bin/bash
# Gætir þurft að gera chmod +x setup.sh svo scriptan virki
# Svo keyriru hana með ./setup.sh

# Corrected Frontend Setup for App Router (no src/)
echo "🚀 Setting up Novora Survey Platform Frontend (App Router)..."

# Create the correct directory structure for App Router
echo "📁 Creating App Router directory structure..."
mkdir -p app/\(dashboard\)/users
mkdir -p app/\(auth\)/login
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/admin
mkdir -p components/shared
mkdir -p lib
mkdir -p hooks
mkdir -p providers
mkdir -p types

echo "✅ App Router directory structure created!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install @radix-ui/react-slot @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast class-variance-authority clsx tailwind-merge lucide-react @tanstack/react-query @tanstack/react-table date-fns

# Install dev dependencies  
npm install -D @types/node tailwindcss-animate

echo "✅ Dependencies installed!"

echo ""
echo "📝 File Structure Created:"
echo "frontend/"
echo "├── app/"
echo "│   ├── globals.css               # Update with CSS variables"
echo "│   ├── layout.tsx                # Root layout"
echo "│   ├── page.tsx                  # Homepage"
echo "│   ├── (dashboard)/"
echo "│   │   ├── layout.tsx            # Dashboard with sidebar"
echo "│   │   ├── page.tsx              # Dashboard home"
echo "│   │   └── users/"
echo "│   │       └── page.tsx          # User management"
echo "│   └── (auth)/"
echo "│       └── login/"
echo "│           └── page.tsx          # Login page"
echo "├── components/"
echo "│   ├── ui/                       # shadcn/ui components"
echo "│   ├── layout/                   # Layout components"
echo "│   ├── admin/                    # Admin components"
echo "│   └── shared/                   # Shared components"
echo "├── lib/"
echo "│   ├── utils.ts                  # Utilities"
echo "│   └── api.ts                    # API client"
echo "└── types/"
echo "    └── user.ts                   # TypeScript types"

echo ""
echo "🎯 Quick Start Steps:"
echo "1. Copy all component code from the artifacts above"
echo "2. Update tailwind.config.js content paths:"
echo "   content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']"
echo "3. Update app/globals.css with the provided CSS variables"
echo "4. Start your servers:"
echo ""
echo "   # Terminal 1: Backend"
echo "   cd ../backend && source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "   # Terminal 2: Frontend"
echo "   npm run dev"
echo ""
echo "5. Visit: http://localhost:3000/dashboard/users"

echo ""
echo "🚀 Your user management page will be live at:"
echo "   http://localhost:3000/dashboard/users"
echo ""
echo "✨ All paths are now correct for App Router!"