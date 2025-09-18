# 🔐 CivicSense Login Credentials & Mock Data Setup

## 📋 **Overview**
This document contains all login credentials and mock data setup for the CivicSense application. The system now uses static mock data instead of database connections for easy testing and development.

## 🚀 **Quick Start Commands**

### **Start All Services:**
```bash
# Terminal 1 - Backend Server
cd Server && npm run dev

# Terminal 2 - Admin Dashboard  
cd Admin && npm run dev -- --port 3001

# Terminal 3 - Client Frontend
cd Client && npm run dev -- --port 3000

# Terminal 4 - Mobile App
cd CivicSenseExpo && npm start
```

## 🔑 **Login Credentials**

### **1. Admin Dashboard** (`http://localhost:3001`)

| **Role** | **Username** | **Password** | **Access Level** |
|----------|--------------|--------------|------------------|
| **System Admin** | `admin` | `admin` | Full system access |
| **Public Works Dept** | `public` | `public` | Department management |
| **Water Department** | `water` | `water` | Department management |
| **Mandal Admin** | `mandal` | `mandal` | Mandal administration |

### **2. Client Frontend** (`http://localhost:3000`)

| **User Type** | **Email** | **Password** | **Description** |
|---------------|-----------|--------------|-----------------|
| **Citizen** | `citizen@civicsense.com` | `citizen123` | Citizen portal access |

### **3. Mobile App (Expo)**

| **User Type** | **Email** | **Password** | **Description** |
|---------------|-----------|--------------|-----------------|
| **Admin** | `admin@civicsense.com` | `admin123` | System administrator |
| **Department Head** | `priya@civicsense.com` | `public123` | Public Works dept |
| **Department Head** | `amit@civicsense.com` | `water123` | Water Department |
| **Mandal Admin** | `mandal@civicsense.com` | `mandal123` | Mandal administrator |
| **Citizen** | `citizen@civicsense.com` | `citizen123` | Citizen user |

## 📱 **Mobile App Setup**

### **Start Expo:**
```bash
cd CivicSenseExpo && npm start
```

### **Access Methods:**
1. **QR Code**: Scan with Expo Go app
2. **Web**: Press `w` in terminal
3. **iOS Simulator**: Press `i` (requires Xcode)
4. **Android Emulator**: Press `a` (requires Android Studio)

## 🗄️ **Mock Data Structure**

### **Users:**
- **5 pre-configured users** with different roles
- **Password hashing** simulated for demo
- **User types**: admin, department, mandal-admin, citizen

### **Reports:**
- **4 sample reports** with different statuses
- **Categories**: Infrastructure, Water, Roads, Sanitation
- **Priorities**: high, medium, low
- **Statuses**: pending, in-progress, completed

### **Departments:**
- Public Works
- Water Department
- Sanitation Department
- Traffic Department
- Parks & Recreation
- Health Department
- Education Department
- Administration

### **Mandal Areas:**
- Central Zone
- North Zone
- South Zone
- East Zone
- West Zone
- All Zones

## 🔧 **API Endpoints**

### **Authentication:**
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

### **Reports:**
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `POST /api/reports/upload-photos` - Upload photos

### **User Types:**
- `GET /api/usertypes` - Get all user types
- `GET /api/usertypes/:id` - Get specific user type

## 🌐 **Service URLs**

| **Service** | **URL** | **Description** |
|-------------|---------|-----------------|
| **Backend API** | `http://localhost:4000` | API server with mock data |
| **Admin Dashboard** | `http://localhost:3001` | Admin interface |
| **Client Frontend** | `http://localhost:3000` | Citizen portal |
| **Expo Dev Server** | `http://localhost:8081` | Mobile development server |

## 🔄 **Database Migration**

### **Current State:**
- ✅ **Mock data** implemented
- ✅ **API endpoints** working
- ✅ **Authentication** functional
- ✅ **All platforms** connected

### **Future Database Integration:**
1. **Replace mock data** with real database calls
2. **Update API routes** to use Supabase
3. **Implement proper** password hashing
4. **Add data persistence** for new users/reports

## 🐛 **Troubleshooting**

### **Common Issues:**
1. **Port conflicts**: Ensure ports 3000, 3001, 4000, 8081 are free
2. **API connection**: Check if backend server is running
3. **Mobile app**: Use `localhost` instead of `192.168.1.8` for local testing
4. **Login failures**: Verify credentials match exactly

### **Reset Mock Data:**
- **Restart server** to reset user registrations
- **Clear browser storage** for fresh login state
- **Reload mobile app** to clear cached data

## 📝 **Notes**

- **Mock data** is stored in memory and resets on server restart
- **Password comparison** is simplified for demo purposes
- **File uploads** still work for photos
- **All CRUD operations** are functional with mock data
- **Ready for database** integration when needed

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Fully Functional with Mock Data
