# 🏥 MediFlow - Smart Medication Management System

A comprehensive medication management application for tracking treatments, medicines, and patient adherence. Available as a web app and mobile app.

## ✨ Features

### 👨‍⚕️ Patient Features
- **Dashboard**: Overview of all treatments and medications
- **Treatment Management**: Add, edit, and track ongoing treatments
- **Medicine Schedule**: Set and track medication times
- **Intake Logs**: Record when you took your medicine
- **Adherence Tracking**: View your medication compliance percentage
- **Recovery Reports**: Track health improvement over time
- **Notifications**: Get reminders for medicine intake
- **Medical History**: Store and view past treatments
- **Health Summary**: Overview of your current health status

### 👨‍💼 Admin Features
- **Dashboard**: Overview of all patients and treatments
- **Patient Management**: View and manage patient data
- **Patient Analytics**: Track patient adherence rates
- **Treatment Reports**: Generate treatment effectiveness reports
- **System Statistics**: Overall system health metrics
- **Patient Recovery**: Monitor patient recovery progress

### 🔒 Security Features
- Secure authentication with password hashing
- Role-based access control (Patient/Admin)
- Session management
- Protected routes
- Encrypted data storage

---

## 🛠️ Tech Stack

### Frontend (Web)
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **Wouter** - Routing
- **Radix UI** - Component library
- **Recharts** - Charts and graphs

### Mobile
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Mobile routing
- **React Query** - Data fetching
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database (Neon)
- **Drizzle ORM** - Database query builder
- **bcrypt** - Password hashing
- **Express Sessions** - Session management

### Database
- **PostgreSQL** - Relational database
- **Neon** - Serverless PostgreSQL host

---

## 📦 Installation

### Prerequisites
- Node.js v22+ ([Download](https://nodejs.org))
- npm or yarn
- Git

### Quick Start (Local Development)

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd smt\ updation
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_random_secret_key
NODE_ENV=development
PORT=5000
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at:
- Web: http://localhost:5173
- API: http://localhost:5000

5. **Login with test credentials**
- Admin:
  - Email: `gsnandish@gmail.com`
  - Password: `Gsnandish`

---

## 📱 Mobile App Setup

### Build Android APK
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Login to Expo
expo login

# Build APK
cd mobile
eas build --platform android --type apk
```

### Build for iOS
```bash
cd mobile
eas build --platform ios
```

---

## 🚀 Deployment

### Quick Deployment (30 minutes)

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for step-by-step guide.

**Summary:**
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Build mobile APK for Android
4. Share URLs with users

### Full Deployment Guide

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive guide covering:
- Backend deployment (Render, Heroku, Railway)
- Frontend deployment (Vercel, Netlify)
- Mobile deployment (TestFlight, Play Store)
- Database deployment
- Configuration and troubleshooting

---

## 📁 Project Structure

```
smt\ updation/
├── client/                 # Web application (React/Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   ├── services/      # API services
│   │   └── lib/           # Utilities
│   └── dist/              # Built files (production)
├── server/                # Backend (Express/Node.js)
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Database queries
├── shared/                # Shared types and schemas
│   └── schema.ts          # Data models
├── mobile/                # Mobile app (React Native)
│   ├── src/
│   │   ├── screens/       # Mobile screens
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   └── navigation/    # Navigation structure
│   └── app.json           # Expo configuration
├── DEPLOYMENT_GUIDE.md    # Comprehensive deployment
├── QUICK_DEPLOY.md        # Quick deployment steps
└── build.bat              # Build helper script
```

---

## 🔐 Authentication

### Admin Login
- Email: `gsnandish@gmail.com`
- Password: `Gsnandish`

### Patient Signup
1. Click "Patient Sign Up"
2. Fill in details
3. Create account
4. Automatically logged in

---

## 📊 Database Schema

### Users
```sql
- id (UUID)
- username (TEXT)
- email (TEXT)
- password (TEXT - hashed)
- role (TEXT - patient/admin)
- fullName (TEXT)
- createdAt (TIMESTAMP)
```

### Treatments
```sql
- id (UUID)
- patientId (UUID)
- name (TEXT)
- description (TEXT)
- status (TEXT - active/inactive/completed)
- startDate (TIMESTAMP)
- endDate (TIMESTAMP)
```

### Medicines
```sql
- id (UUID)
- treatmentId (UUID)
- name (TEXT)
- dosage (TEXT)
- frequency (TEXT)
- scheduleTime (TEXT)
- stock (INTEGER)
```

### Intake Logs
```sql
- id (UUID)
- medicineId (UUID)
- scheduledTime (TIMESTAMP)
- takenTime (TIMESTAMP)
- status (TEXT - pending/taken/missed)
- notes (TEXT)
```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Treatments
- `GET /api/treatments` - Get all treatments
- `POST /api/treatments` - Create treatment
- `PUT /api/treatments/:id` - Update treatment
- `DELETE /api/treatments/:id` - Delete treatment

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Intake Logs
- `GET /api/intake-logs` - Get intake logs
- `POST /api/intake-logs` - Log medicine intake

### Admin
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/patients/:id` - Get patient details

---

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific file
npm test -- filename.test.ts

# Watch mode
npm test -- --watch
```

---

## 🐛 Troubleshooting

### Web app won't start
```bash
# Clear dependencies and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### API connection errors
1. Check backend is running on port 5000
2. Verify DATABASE_URL in .env
3. Check CORS settings in server/index.ts

### Mobile app won't build
```bash
# Update Expo CLI
npm install -g expo-cli@latest

# Clear cache
expo prebuild --clean
```

### Database connection issues
1. Verify DATABASE_URL is correct
2. Check internet connection
3. Verify database is accessible from your IP
4. Check PostgreSQL credentials

---

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment guide
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Quick deployment (recommended)
- [build.bat](./build.bat) - Build helper script
- [design_guidelines.md](./design_guidelines.md) - UI/UX guidelines

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review deployment guides
3. Check API endpoints documentation

---

## 🎯 Roadmap

- [ ] SMS/Email notifications
- [ ] Wearable device integration
- [ ] AI-based health insights
- [ ] Multi-language support
- [ ] Offline mode for mobile
- [ ] Video consultation feature
- [ ] Prescription scanning with OCR

---

## 👨‍💻 Authors

**MediFlow Development Team**
- Smart Medication Management System
- Built with ❤️ for better healthcare

---

**Last Updated:** November 2025

**Status:** ✅ Production Ready

---

## Quick Links

- 🌐 [Web App](#deployment)
- 📱 [Mobile App](#mobile-app-setup)
- ☁️ [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 🚀 [Quick Deploy](./QUICK_DEPLOY.md)
- 📊 [System Architecture](#tech-stack)
