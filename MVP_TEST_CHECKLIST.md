# 🧪 Novora MVP Test Checklist

## ✅ Core User Stories Testing

### 1. Survey Creation (< 15 seconds)
- [ ] Go to `http://localhost:3000/mvp`
- [ ] Click "Start Free Pilot"
- [ ] Sign up with email/password
- [ ] Create survey with title
- [ ] Copy survey link
- [ ] **Time**: Should take < 15 seconds

### 2. Anonymous Response (< 20 seconds)
- [ ] Open survey link in new tab/incognito
- [ ] Rate 0-10 (mobile-friendly)
- [ ] Add optional comment
- [ ] Submit response
- [ ] See "Thank You" screen
- [ ] **Time**: Should take < 20 seconds

### 3. Min-N Guard (≥5 responses)
- [ ] Submit 1-4 responses
- [ ] Dashboard shows "locked" state
- [ ] No results/comments visible
- [ ] Submit 5th response
- [ ] Dashboard unlocks
- [ ] Results and comments appear

### 4. WhatsApp Sharing
- [ ] Go to dashboard
- [ ] Click "Share via WhatsApp" button
- [ ] WhatsApp opens with prefilled message
- [ ] Message includes survey link
- [ ] Test in different languages (ES/EN/IS)

## ✅ Frontend Surfaces Testing

### Landing Page
- [ ] Hero section displays correctly
- [ ] "Start Free Pilot" button works
- [ ] "See Sample Dashboard" button works
- [ ] "How it works" section visible
- [ ] Privacy strip shows "≥5 responses"
- [ ] Language selector works (ES/EN/IS)

### Authentication
- [ ] Sign up with email/password
- [ ] Sign in with credentials
- [ ] Password reset (optional)
- [ ] Logout works

### Create Survey
- [ ] Single title field
- [ ] Survey creation works
- [ ] Team link generated
- [ ] Copy button works

### Employee Survey
- [ ] 0-10 rating input
- [ ] Optional comment field
- [ ] Submit works
- [ ] Thank you screen
- [ ] No login required
- [ ] Mobile responsive

### Dashboard
- [ ] KPI cards show correct data
- [ ] Average score calculation
- [ ] Mini trend line
- [ ] Comments list (newest first)
- [ ] Locked state when n < MIN_N
- [ ] Share area with copy link
- [ ] WhatsApp share button
- [ ] Status indicators

## ✅ Backend API Testing

### Health Check
- [ ] `GET /health` returns 200
- [ ] `GET /api/v1/health` returns 200

### Authentication
- [ ] `POST /api/v1/auth/register` works
- [ ] `POST /api/v1/auth/login` works
- [ ] JWT tokens generated
- [ ] Protected routes work

### Survey Management
- [ ] `POST /api/v1/surveys` creates survey
- [ ] `GET /api/v1/surveys/{id}` returns survey
- [ ] `GET /api/v1/surveys/{id}/public` works

### Response Handling
- [ ] `POST /api/v1/surveys/{id}/responses` accepts responses
- [ ] Anonymous responses stored
- [ ] No identity fields saved

### Summary Endpoint
- [ ] `GET /api/v1/surveys/{id}/summary` returns locked when n < MIN_N
- [ ] Returns unlocked data when n ≥ MIN_N
- [ ] Average score calculation correct
- [ ] Comments included when unlocked

## ✅ Privacy & Anonymity Testing

- [ ] No identity fields in response records
- [ ] Min-N guard enforced everywhere
- [ ] Results locked until threshold met
- [ ] Single-use tokens work
- [ ] No PII in analytics

## ✅ WhatsApp Sharing Testing

- [ ] Team link share opens WhatsApp
- [ ] Prefilled Spanish message
- [ ] Message includes survey link
- [ ] Privacy note included
- [ ] Works on mobile and desktop
- [ ] Language-specific messages

## ✅ Browser Compatibility

- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile responsive

## ✅ Performance Testing

- [ ] Survey creation < 15 seconds
- [ ] Response submission < 20 seconds
- [ ] Dashboard loads quickly
- [ ] Mobile performance good

## 🚨 Common Issues to Check

- [ ] CORS errors
- [ ] JWT token expiration
- [ ] Database connection
- [ ] Environment variables
- [ ] API endpoints responding
- [ ] Frontend-backend communication

## 📱 Mobile Testing

- [ ] Touch-friendly interface
- [ ] 0-10 rating works on mobile
- [ ] WhatsApp sharing works
- [ ] Responsive design
- [ ] Fast loading

## 🌐 Language Testing

- [ ] Spanish (default)
- [ ] English
- [ ] Icelandic
- [ ] Language switching works
- [ ] WhatsApp messages in correct language

---

## 🎯 Success Criteria

**MVP is ready when:**
- ✅ All core user stories work
- ✅ Min-N guard functions correctly
- ✅ WhatsApp sharing works
- ✅ Mobile responsive
- ✅ Multi-language support
- ✅ No critical bugs
- ✅ Performance targets met

**Ready for pilot testing!** 🚀
