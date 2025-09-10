# 🚀 Novora MVP Deployment Guide

## Frontend Deployment (Vercel)

### Option 1: Using Vercel CLI
```bash
cd Novora/frontend
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL`: `https://novora-backend.onrender.com`
   - `VITE_MIN_N`: `5`
   - `VITE_DEFAULT_LANG`: `es`

## Backend Deployment (Render)

### Option 1: Using Render Dashboard
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set:
   - Build Command: `pip install -r requirements/production.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment: `Python 3`

### Option 2: Using render.yaml
1. Push `render.yaml` to your repository
2. Render will auto-deploy

## Environment Variables

### Frontend (Vercel)
- `VITE_API_URL`: Your backend URL
- `VITE_MIN_N`: Minimum responses (default: 5)
- `VITE_DEFAULT_LANG`: Default language (es/en/is)

### Backend (Render)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `MIN_N`: Minimum responses for anonymity
- `ENVIRONMENT`: production
- `ALLOWED_ORIGINS`: Your frontend domain

## Database Setup

### PostgreSQL (Render)
1. Create PostgreSQL database on Render
2. Copy connection string to `DATABASE_URL`
3. Run migrations:
```bash
alembic upgrade head
```

## Testing Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit `https://your-backend.onrender.com/docs`
3. **Full Flow**: Test survey creation and responses

## URLs After Deployment

- **Frontend**: `https://novora-mvp.vercel.app`
- **Backend**: `https://novora-backend.onrender.com`
- **API Docs**: `https://novora-backend.onrender.com/docs`

## Troubleshooting

- Check Render logs for backend issues
- Check Vercel functions for frontend issues
- Verify environment variables are set correctly
- Test API endpoints with Postman/curl
