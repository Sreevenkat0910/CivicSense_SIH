# 🏛️ CivicSense - Comprehensive Civic Issue Management Platform

## 📋 **Project Overview**

CivicSense is a comprehensive civic issue management platform designed to streamline the reporting, tracking, and resolution of municipal issues. The platform consists of three main components: a **Flutter mobile application** for citizens, a **React/TypeScript admin dashboard** for government officials, and a **Node.js backend server** that powers the entire ecosystem.

### 🎯 **Core Mission**
To bridge the gap between citizens and local government by providing an efficient, transparent, and user-friendly platform for civic issue reporting and management.

---

## 🏗️ **System Architecture**

### **Three-Tier Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │  React Admin    │    │  Node.js API    │
│   (Citizens)    │◄──►│   Dashboard     │◄──►│    Server       │
│                 │    │ (Officials)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📱 **1. Flutter Mobile Application**

### **Location**: `civic_sense_mobile/`

### **Technology Stack**
- **Framework**: Flutter 3.5.4+
- **State Management**: Provider
- **Navigation**: Go Router
- **HTTP Client**: http package
- **Maps**: flutter_map (Leaflet implementation)
- **Location Services**: geolocator, geocoding
- **Image Handling**: image_picker
- **Local Storage**: shared_preferences
- **Authentication**: Google Sign-In integration

### **Key Features**

#### **🏠 Home Screen**
- **Welcome Dashboard**: Personalized greeting with user information
- **Quick Actions**: Direct access to report issues and view nearby problems
- **Recent Issues**: Display of latest civic issues in the area
- **Pull-to-Refresh**: Real-time data updates

#### **📝 Issue Reporting**
- **Comprehensive Form**: Title, category, description, location
- **Location Services**: Automatic GPS location detection with address resolution
- **Photo Capture**: Camera and gallery integration for visual evidence
- **Voice Notes**: Audio recording capability for detailed descriptions
- **Category Selection**: Predefined categories (Infrastructure, Water, Roads, etc.)
- **Form Validation**: Client-side validation with user-friendly error messages

#### **🗺️ Interactive Maps**
- **Issue Visualization**: Map view showing all reported issues
- **Status Indicators**: Color-coded markers for different issue statuses
- **Location Services**: Current location display and navigation
- **Issue Details**: Tap markers to view issue information

#### **📋 Issue Management**
- **My Reports**: Personal dashboard showing user's submitted issues
- **Status Tracking**: Real-time status updates (Pending, In Progress, Completed)
- **Nearby Issues**: Location-based issue discovery
- **Issue Details**: Comprehensive view with photos, descriptions, and updates

#### **👤 User Profile**
- **Account Management**: User information and settings
- **Authentication**: Secure login/logout functionality
- **Session Management**: Persistent login state

### **App Structure**
```
lib/
├── main.dart                 # App entry point with routing
├── models/
│   └── issue.dart          # Data models and enums
├── providers/
│   ├── auth_provider.dart   # Authentication state management
│   └── issue_provider.dart  # Issue data management
├── screens/
│   ├── home_screen.dart     # Main dashboard
│   ├── login_screen.dart    # Authentication
│   ├── registration_screen.dart
│   ├── report_issue_screen.dart
│   ├── my_reports_screen.dart
│   ├── nearby_issues_screen.dart
│   ├── map_screen.dart
│   └── profile_screen.dart
├── services/
│   └── api_service.dart     # Backend API communication
└── widgets/
    └── issue_list_item.dart # Reusable UI components
```

---

## 🖥️ **2. React Admin Dashboard**

### **Location**: `Admin/`

### **Technology Stack**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet with Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **State Management**: React useState/useEffect

### **Role-Based Access Control**

#### **🔐 User Roles**
1. **System Admin**: Full system access and management
2. **Mandal Admin**: Regional administration and oversight
3. **Department Head**: Department-specific management
4. **Department Employee**: Task assignment and issue handling

#### **📊 Dashboard Features**

##### **Mandal Admin Dashboard**
- **Comprehensive Overview**: Department performance metrics
- **Issue Management**: Real-time issue tracking and assignment
- **User Management**: Staff administration and role assignment
- **Analytics**: Performance metrics and trend analysis
- **Map Integration**: Geographic issue visualization
- **Department Oversight**: Multi-department management

##### **Department Head Dashboard**
- **Department Focus**: Department-specific issue management
- **Employee Management**: Staff assignment and task distribution
- **Issue Assignment**: Task delegation to department employees
- **Performance Tracking**: Department efficiency metrics
- **Schedule Management**: Work scheduling and planning

##### **Department Employee Dashboard**
- **Task Management**: Assigned issues and responsibilities
- **Issue Updates**: Status updates and progress reporting
- **Schedule View**: Personal work schedule and assignments
- **Notification System**: Real-time updates and alerts

### **Key Components**

#### **🗺️ Interactive City Map**
- **Real-time Issue Visualization**: Live map showing all civic issues
- **Status-based Markers**: Color-coded markers for different issue statuses
- **Issue Details**: Click markers to view comprehensive issue information
- **Geographic Filtering**: Location-based issue filtering

#### **📈 Analytics Dashboard**
- **Performance Metrics**: Issue resolution statistics
- **Trend Analysis**: Historical data and patterns
- **Department Comparison**: Cross-department performance analysis
- **Efficiency Tracking**: Resolution time and success rates

#### **👥 User Management**
- **Role Assignment**: Flexible user role management
- **Department Assignment**: User-to-department mapping
- **Permission Control**: Granular access control
- **Activity Monitoring**: User activity tracking

#### **📅 Schedule Management**
- **Work Planning**: Task scheduling and assignment
- **Resource Allocation**: Staff and resource management
- **Timeline Tracking**: Project timeline visualization
- **Calendar Integration**: Integrated calendar system

### **Admin Structure**
```
src/
├── App.tsx                    # Main application component
├── components/
│   ├── ui/                   # Reusable UI components (48 files)
│   ├── DashboardPage.tsx     # Main dashboard
│   ├── MandalAdminDashboard.tsx
│   ├── HodDashboard.tsx
│   ├── DepartmentEmployeeDashboard.tsx
│   ├── CityMapView.tsx       # Interactive map component
│   ├── IssueTable.tsx        # Issue management table
│   ├── AnalyticsWidgets.tsx  # Performance metrics
│   ├── NavigationSidebar.tsx # Role-based navigation
│   ├── LoginPage.tsx         # Authentication
│   ├── UserManagement.tsx   # User administration
│   ├── DepartmentManagement.tsx
│   ├── SchedulePage.tsx     # Work scheduling
│   ├── MyTimetable.tsx      # Personal schedule
│   └── NotificationsPanel.tsx
├── styles/
│   ├── globals.css          # Global styles
│   ├── leaflet.css          # Map styling
│   └── map-background.css   # Map background
└── types/
    └── leaflet.d.ts         # TypeScript definitions
```

---

## 🖥️ **3. Node.js Backend Server**

### **Location**: `Server/`

### **Technology Stack**
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js 5.1.0
- **Database**: Supabase (PostgreSQL)
- **Authentication**: bcrypt for password hashing
- **File Upload**: Multer for image handling
- **Security**: Helmet for security headers
- **CORS**: Cross-origin resource sharing
- **Logging**: Morgan for request logging

### **API Architecture**

#### **🔗 RESTful API Endpoints**

##### **Authentication Routes** (`/api/users`)
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- Password hashing with bcrypt
- Session management

##### **Issue Management Routes** (`/api/reports`)
- `GET /api/reports` - Retrieve all issues
- `GET /api/reports/:id` - Get specific issue details
- `POST /api/reports` - Create new issue report
- `POST /api/reports/upload-photos` - Image upload handling

##### **User Type Management** (`/api/usertypes`)
- `GET /api/usertypes` - Retrieve user types
- `GET /api/usertypes/:id` - Get specific user type

#### **📁 File Upload System**
- **Image Processing**: Multer-based image upload
- **File Validation**: Image type and size validation
- **Storage**: Local file system with organized directory structure
- **URL Generation**: Dynamic URL generation for uploaded files

#### **🗄️ Data Management**

##### **Mock Data System**
- **Static Data**: Pre-configured users, reports, and departments
- **Demo Environment**: No database dependency for testing
- **Realistic Data**: Comprehensive mock data for all entities
- **Easy Migration**: Ready for database integration

##### **Data Models**
```javascript
// User Model
{
  id: "user-001",
  user_id: "user-001", 
  full_name: "Rajesh Kumar",
  email: "admin@civicsense.com",
  mobile: "+91 9876543210",
  usertype_id: 1,
  department: "Administration",
  mandal_area: "Central Zone",
  is_active: true
}

// Issue Model
{
  id: "report-001",
  report_id: "CIV-2024-001",
  title: "Broken Street Light",
  description: "Street light not working",
  category: "Infrastructure",
  priority: "medium",
  status: "pending",
  location: "Main Road, Central Park",
  latitude: 18.4361,
  longitude: 79.1282,
  images: ["image_urls"],
  reporter_name: "Rajesh Kumar",
  department: "Public Works",
  created_at: "2024-01-15T10:30:00Z"
}
```

### **Server Structure**
```
src/
├── index.js                 # Main server entry point
├── routes/
│   ├── reports.js          # Issue management routes
│   ├── users.js            # Authentication routes
│   └── usertypes.js        # User type routes
├── lib/
│   └── supabase.js         # Database connection
├── data/
│   └── mockData.js         # Static mock data
├── utils/
│   └── id.js              # ID generation utilities
└── uploads/
    └── photos/            # Uploaded image storage
```

---

## 🔧 **Technical Implementation Details**

### **🔐 Authentication System**
- **Multi-role Authentication**: Support for different user types
- **Password Security**: bcrypt hashing for password protection
- **Session Management**: Persistent login sessions
- **Role-based Access**: Granular permission system

### **🗺️ Location Services**
- **GPS Integration**: Automatic location detection
- **Address Resolution**: Coordinate-to-address conversion
- **Map Visualization**: Interactive maps with issue markers
- **Geographic Filtering**: Location-based issue discovery

### **📸 Media Handling**
- **Image Upload**: Camera and gallery integration
- **File Validation**: Type and size validation
- **Storage Management**: Organized file storage system
- **URL Generation**: Dynamic image URL creation

### **📱 Cross-Platform Compatibility**
- **Flutter**: iOS, Android, and Web support
- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: Web application capabilities
- **Offline Support**: Local data caching

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- Flutter 3.5.4+
- npm/yarn package manager
- Git version control

### **Installation Steps**

#### **1. Clone Repository**
```bash
git clone <repository-url>
cd CivicSense
```

#### **2. Backend Server Setup**
```bash
cd Server
npm install
npm run dev
# Server runs on http://localhost:4000
```

#### **3. Admin Dashboard Setup**
```bash
cd Admin
npm install
npm run dev
# Dashboard runs on http://localhost:3001
```

#### **4. Flutter Mobile App Setup**
```bash
cd civic_sense_mobile
flutter pub get
flutter run
# App runs on connected device/emulator
```

### **🔑 Default Login Credentials**

#### **Admin Dashboard** (`http://localhost:3001`)
| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| System Admin | `admin` | `admin` | Full system access |
| Public Works Dept | `public` | `public` | Department management |
| Water Department | `water` | `water` | Department management |
| Mandal Admin | `mandal` | `mandal` | Mandal administration |

#### **Mobile App**
| User Type | Email | Password | Description |
|-----------|-------|----------|-------------|
| Admin | `admin@civicsense.com` | `admin123` | System administrator |
| Department Head | `priya@civicsense.com` | `public123` | Public Works dept |
| Department Head | `amit@civicsense.com` | `water123` | Water Department |
| Mandal Admin | `mandal@civicsense.com` | `mandal123` | Mandal administrator |
| Citizen | `citizen@civicsense.com` | `citizen123` | Citizen user |

---

## 📊 **System Features**

### **🎯 Core Functionality**

#### **For Citizens (Mobile App)**
- ✅ **Issue Reporting**: Easy-to-use form with photo/audio support
- ✅ **Location Services**: Automatic GPS location detection
- ✅ **Issue Tracking**: Real-time status updates
- ✅ **Map Visualization**: Interactive map with issue locations
- ✅ **User Profile**: Account management and settings
- ✅ **Nearby Issues**: Location-based issue discovery

#### **For Government Officials (Admin Dashboard)**
- ✅ **Role-based Access**: Different dashboards for different roles
- ✅ **Issue Management**: Comprehensive issue tracking and assignment
- ✅ **User Administration**: Staff management and role assignment
- ✅ **Analytics Dashboard**: Performance metrics and insights
- ✅ **Map Integration**: Geographic issue visualization
- ✅ **Schedule Management**: Work planning and resource allocation
- ✅ **Department Management**: Multi-department oversight

#### **For System Administrators**
- ✅ **User Management**: Complete user lifecycle management
- ✅ **Department Configuration**: Department setup and management
- ✅ **System Settings**: Global system configuration
- ✅ **Analytics & Reporting**: Comprehensive system analytics
- ✅ **Permission Management**: Granular access control

### **🔧 Technical Features**
- ✅ **RESTful API**: Well-structured API endpoints
- ✅ **File Upload**: Image and media handling
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Cross-platform**: iOS, Android, and Web support
- ✅ **Security**: Password hashing and secure authentication
- ✅ **Scalability**: Modular architecture for easy expansion

---

## 🗂️ **Project Structure**

```
CivicSense/
├── 📱 civic_sense_mobile/          # Flutter Mobile Application
│   ├── lib/                        # Dart source code
│   ├── android/                    # Android-specific files
│   ├── ios/                        # iOS-specific files
│   ├── web/                        # Web-specific files
│   └── pubspec.yaml               # Flutter dependencies
├── 🖥️ Admin/                       # React Admin Dashboard
│   ├── src/                        # TypeScript source code
│   ├── public/                     # Static assets
│   └── package.json               # Node.js dependencies
├── 🖥️ Server/                      # Node.js Backend Server
│   ├── src/                        # JavaScript source code
│   ├── uploads/                    # File upload storage
│   └── package.json               # Node.js dependencies
├── 📋 LOGIN_CREDENTIALS.md        # Authentication details
└── 📖 README.md                   # This documentation
```

---

## 🔮 **Future Enhancements**

### **Planned Features**
- 🔄 **Real Database Integration**: Migration from mock data to PostgreSQL
- 📱 **Push Notifications**: Real-time issue updates
- 🔍 **Advanced Search**: Filtering and search capabilities
- 📊 **Advanced Analytics**: Machine learning insights
- 🌐 **Multi-language Support**: Internationalization
- 🔐 **Enhanced Security**: JWT tokens and OAuth integration
- 📈 **Performance Optimization**: Caching and optimization
- 🤖 **AI Integration**: Automated issue categorization

### **Scalability Considerations**
- **Microservices Architecture**: Service decomposition
- **Cloud Deployment**: AWS/Azure integration
- **Load Balancing**: High availability setup
- **Caching Layer**: Redis integration
- **CDN Integration**: Static asset optimization

---

## 🤝 **Contributing**

### **Development Guidelines**
1. **Code Style**: Follow existing code conventions
2. **Documentation**: Update documentation for new features
3. **Testing**: Write tests for new functionality
4. **Commit Messages**: Use descriptive commit messages
5. **Pull Requests**: Provide detailed PR descriptions

### **Issue Reporting**
- Use GitHub Issues for bug reports
- Provide detailed reproduction steps
- Include system information and logs
- Use appropriate labels and milestones

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 **Team & Acknowledgments**

### **Development Team**
- **Frontend Development**: React/TypeScript expertise
- **Mobile Development**: Flutter/Dart expertise  
- **Backend Development**: Node.js/Express expertise
- **UI/UX Design**: User experience optimization
- **DevOps**: Deployment and infrastructure

### **Special Thanks**
- **Open Source Community**: For excellent libraries and tools
- **Flutter Team**: For the amazing cross-platform framework
- **React Community**: For robust UI components
- **Node.js Community**: For the powerful backend platform

---

## 📞 **Support & Contact**

### **Documentation**
- **API Documentation**: Available in `/Server/docs`
- **Component Library**: Available in `/Admin/src/components/ui`
- **Flutter Widgets**: Available in `/civic_sense_mobile/lib/widgets`

### **Getting Help**
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Comprehensive guides and examples
- **Code Comments**: Well-documented source code
- **Examples**: Sample implementations and use cases

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready with Mock Data

---

*CivicSense - Empowering communities through technology* 🏛️✨
