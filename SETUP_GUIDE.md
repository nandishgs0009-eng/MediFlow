# MediFlow - Smart Medication Tracker - Complete Setup & Testing Guide

## ✅ Project Structure Overview

This is a **full-stack TypeScript application** with:
- **Frontend**: React 18 + TypeScript + Vite + Wouter routing
- **Backend**: Express.js + TypeScript + PostgreSQL (Neon) + Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **UI Components**: Radix UI + Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (currently using v22.19.0)
- npm or yarn
- PostgreSQL database (Neon is configured via .env)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file in the root directory with:
```env
DATABASE_URL=your_neon_postgresql_url
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 📋 User Roles & Access

### Patient Role
- **Login Redirect**: `/patient/overview`
- **Default Page**: Patient Overview Dashboard
- **Access**:
  - Overview (Dashboard)
  - Treatment Management
  - Medicine History
  - Recovery Reports
  - Health Summary
  - Settings (Profile, Notifications, Medical Records)

**Test Credentials**:
- Username: Any username you sign up with
- Email: Any email you sign up with
- Password: Your chosen password

### Admin Role
- **Login Redirect**: `/admin/dashboard`
- **Default Page**: Admin Dashboard
- **Access**:
  - Dashboard (Statistics)
  - Patient Management
  - Patient Reports
  - Recovery Analytics

**Test Credentials**:
- Email: `gsnandish@gmail.com`
- Password: `Gsnandish`

## 🔐 Security Features

✅ **Role-Based Access Control (RBAC)**
- Patients cannot access admin routes
- Admins cannot access patient routes
- Frontend route protection with ProtectedRoute component
- Backend route protection with requireRole middleware

✅ **Password Security**
- bcrypt hashing (SALT_ROUNDS=10)
- Passwords never stored in plaintext

✅ **Session Management**
- PostgreSQL-backed sessions
- 7-day session expiration
- HTTPOnly cookies

✅ **Authentication Flow**
- Login endpoint validates credentials
- Session created on successful login
- Auth middleware protects routes
- Logout clears session

## 🧪 Testing Workflows

### Test 1: Patient Signup & Login
1. Go to `http://localhost:5000`
2. Click "Patient Sign Up"
3. Fill in:
   - Full Name: John Doe
   - Email: john@example.com
   - Username: johndoe
   - Password: password123
4. ✅ Should redirect to `/patient/overview`
5. Click "Logout" in sidebar
6. ✅ Should return to landing page
7. Click "Patient Login"
8. Enter: Username/Email: `john@example.com`, Password: `password123`
9. ✅ Should redirect to `/patient/overview`

### Test 2: Admin Login
1. Go to `http://localhost:5000`
2. Click "Admin Sign In"
3. Enter:
   - Username/Email: `gsnandish@gmail.com`
   - Password: `Gsnandish`
4. ✅ Should redirect to `/admin/dashboard`
5. ✅ Should show admin sidebar menu
6. Click "Logout"
7. ✅ Should return to landing page immediately

### Test 3: Role-Based Access Control
1. Login as Patient
2. Try accessing `/admin/dashboard` manually
3. ✅ Should be redirected to `/patient/overview`
4. Logout, then login as Admin
5. Try accessing `/patient/dashboard` manually
6. ✅ Should be redirected to `/admin/dashboard`

### Test 4: Patient Workflow
1. Login as Patient
2. Go to "Add Treatment" (from sidebar or dashboard)
3. Add a new treatment:
   - Name: Blood Pressure Management
   - Description: Daily monitoring
   - Status: Active
4. Add medicines to treatment
5. Go to "Medicine History" to see intake logs
6. Go to "Recovery Reports" to see health summary
7. ✅ All patient features should work

### Test 5: Admin Workflow
1. Login as Admin
2. Go to "Patients" to see all patients
3. Click on a patient to see details
4. Go to "Reports" to see analytics
5. ✅ Admin features should work

## 📊 Database Schema

The application uses these tables:
- **users**: User accounts with role (patient/admin)
- **treatments**: Patient treatments
- **medicines**: Medicines within treatments
- **intakeLogs**: Medicine intake history
- **notifications**: System notifications
- **user_sessions**: Session management

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account (patient only)
- `POST /api/auth/login` - Login (patient or admin)
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)

### Patient Endpoints
- `GET /api/treatments` - List treatments
- `POST /api/treatments` - Create treatment
- `GET /api/medicines` - List medicines
- `POST /api/medicines` - Add medicine
- `POST /api/intake-logs` - Log medicine intake
- `GET /api/notifications` - List notifications

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/patients/all` - List all patients
- `GET /api/admin/patients/detailed/all` - Detailed patient info
- `DELETE /api/admin/patients/:id` - Delete patient

## 🎨 UI/UX Features

✅ **Theme Support**
- Light mode
- Dark mode
- Toggle in header

✅ **Responsive Design**
- Mobile-friendly sidebar
- Collapsible navigation
- Touch-friendly buttons

✅ **Real-time Updates**
- Vite HMR (Hot Module Reloading)
- Changes reflect immediately

## 🔧 Troubleshooting

### Issue: Login fails with "Invalid credentials"
**Solution**: 
- Verify you're using correct email/password
- Check browser console (F12) for errors
- Ensure database connection is working

### Issue: Admin user not found
**Solution**:
- Run seed script: `npx tsx server/seed-admin-user.ts`
- Check admin exists: `npx tsx server/check-and-fix-admin.ts`

### Issue: Session not persisting
**Solution**:
- Clear browser cookies
- Check `.env` for SESSION_SECRET
- Verify PostgreSQL connection

### Issue: Role-based redirects not working
**Solution**:
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for routing errors
- Verify ProtectedRoute is wrapping routes

## 📝 Development Notes

- **Frontend**: React Components in `/client/src/components`
- **Pages**: Page components in `/client/src/pages`
- **Backend**: Route handlers in `/server/routes.ts`
- **Database**: Schema in `/shared/schema.ts`
- **Styling**: Tailwind CSS + Radix UI components

## 🚀 Deployment Preparation

Before deploying:
1. Set `NODE_ENV=production`
2. Update `SESSION_SECRET` to secure random string
3. Configure Neon PostgreSQL URL
4. Build frontend: `npm run build`
5. Build backend: `npm run build`
6. Start with: `npm start`

## 📞 Support

If you encounter issues:
1. Check terminal logs
2. Check browser console (F12)
3. Verify `.env` configuration
4. Ensure database connection is working
5. Clear browser cache and cookies
