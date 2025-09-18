# Frontend-Backend Integration Guide

This guide explains how to integrate the CivicSense frontend applications with the backend API.

## Quick Start

### 1. Backend Setup
```bash
cd Server
npm install
# Create .env file with Supabase credentials
npm run dev
```

### 2. Frontend Integration

#### Admin Dashboard (React/TypeScript)

The Admin dashboard already has an API service created at `src/services/api.ts`. To use it:

```typescript
import ApiService from './services/api';

// Set authentication token after login
ApiService.setToken(userToken);

// Example: Get reports
const response = await ApiService.getReports({
  page: 1,
  limit: 20,
  status: 'pending'
});

if (response.success) {
  console.log('Reports:', response.data.reports);
} else {
  console.error('Error:', response.error);
}
```

#### Mobile App (Flutter/Dart)

Update the existing `api_service.dart` to use the new endpoints:

```dart
// Update base URL if needed
static const String baseUrl = 'http://192.168.1.8:4000';

// Use new auth endpoints
static Future<Map<String, dynamic>?> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/login'),
    headers: _headers,
    body: jsonEncode({
      'email': email,
      'password': password,
    }),
  );
  // Handle response...
}
```

## API Integration Examples

### Authentication Flow

1. **Login**
```typescript
const loginResponse = await ApiService.login('admin@civicsense.com', 'admin123');
if (loginResponse.success) {
  const { token, user } = loginResponse.data;
  ApiService.setToken(token);
  // Store user data and token
}
```

2. **Verify Token**
```typescript
const verifyResponse = await ApiService.verifyToken();
if (verifyResponse.success) {
  // User is authenticated
  const user = verifyResponse.data.user;
}
```

### Report Management

1. **Get Reports with Filters**
```typescript
const reportsResponse = await ApiService.getReports({
  page: 1,
  limit: 20,
  status: 'pending',
  department: 'Public Works',
  priority: 'high'
});
```

2. **Create Report**
```typescript
const newReport = await ApiService.createReport({
  title: 'Broken Street Light',
  category: 'Infrastructure',
  description: 'Street light not working',
  department: 'Public Works',
  latitude: 18.4361,
  longitude: 79.1282,
  photos: [{ url: 'photo_url', caption: 'Broken light' }]
});
```

3. **Update Report Status**
```typescript
const updateResponse = await ApiService.updateReportStatus(reportId, {
  status: 'in_progress',
  assigned_to: 'Maintenance Team',
  resolution_notes: 'Work in progress'
});
```

### User Management

1. **Get Users (Admin Only)**
```typescript
const usersResponse = await ApiService.getUsers({
  page: 1,
  limit: 20,
  department: 'Public Works',
  is_active: true
});
```

2. **Update User Profile**
```typescript
const updateResponse = await ApiService.updateUser(userId, {
  full_name: 'Updated Name',
  mobile: '+91 9876543210',
  department: 'Water Department'
});
```

### Notifications

1. **Get Notifications**
```typescript
const notificationsResponse = await ApiService.getNotifications({
  page: 1,
  limit: 10,
  is_read: false
});
```

2. **Mark as Read**
```typescript
await ApiService.markNotificationAsRead(notificationId);
```

### Schedules

1. **Get Schedules**
```typescript
const schedulesResponse = await ApiService.getSchedules({
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});
```

2. **Create Schedule**
```typescript
const newSchedule = await ApiService.createSchedule({
  title: 'Department Meeting',
  description: 'Weekly review meeting',
  start_time: '2024-01-20T10:00:00Z',
  end_time: '2024-01-20T11:00:00Z',
  location: 'Conference Room A'
});
```

### Analytics

1. **Get Dashboard Overview**
```typescript
const overviewResponse = await ApiService.getOverviewStats(30); // Last 30 days
```

2. **Get Department Statistics**
```typescript
const deptStatsResponse = await ApiService.getDepartmentStats(30);
```

## Error Handling

Always handle API responses properly:

```typescript
const response = await ApiService.getReports();
if (response.success) {
  // Handle success
  const data = response.data;
} else {
  // Handle error
  console.error('API Error:', response.error);
  // Show user-friendly error message
}
```

## Authentication State Management

### React Context Example

```typescript
// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import ApiService from './services/api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      ApiService.setToken(token);
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    const response = await ApiService.verifyToken();
    if (response.success) {
      setUser(response.data.user);
    } else {
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await ApiService.login(email, password);
    if (response.success) {
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      ApiService.setToken(newToken);
      return true;
    }
    return false;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    ApiService.setToken('');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## File Upload Integration

### Photo Upload

```typescript
const uploadPhotos = async (files: FileList) => {
  const response = await ApiService.uploadPhotos(files);
  if (response.success) {
    const photoUrls = response.data.photos.map(photo => photo.url);
    return photoUrls;
  } else {
    throw new Error(response.error);
  }
};

// Usage in form
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (files) {
    try {
      const photoUrls = await uploadPhotos(files);
      // Use photoUrls in your report creation
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
};
```

## Environment Configuration

### Development
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000` (Admin), `http://localhost:8080` (Mobile)

### Production
Update the API base URL in your frontend applications:

```typescript
// Admin/src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api-domain.com/api';
```

```dart
// Mobile/lib/services/api_service.dart
static const String baseUrl = String.fromEnvironment('API_URL', defaultValue: 'https://your-api-domain.com');
```

## Testing Integration

### Manual Testing

1. Start the backend server
2. Test endpoints using Postman or curl
3. Verify authentication flow
4. Test file uploads
5. Check error handling

### Automated Testing

```typescript
// Example test
describe('API Integration', () => {
  test('should login successfully', async () => {
    const response = await ApiService.login('admin@civicsense.com', 'admin123');
    expect(response.success).toBe(true);
    expect(response.data.token).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS origins are configured in backend
2. **Authentication Failures**: Check JWT token format and expiration
3. **File Upload Issues**: Verify file size limits and MIME types
4. **Database Connection**: Check Supabase credentials and network access

### Debug Mode

Enable debug logging in the backend:

```javascript
// Add to your backend
app.use(morgan('dev')); // Already included
console.log('Environment:', process.env.NODE_ENV);
```

## Next Steps

1. **Implement Real-time Updates**: Add WebSocket support for live notifications
2. **Add Caching**: Implement Redis for better performance
3. **Rate Limiting**: Add rate limiting for API endpoints
4. **Monitoring**: Set up logging and monitoring
5. **Testing**: Add comprehensive test coverage
6. **Documentation**: Generate API documentation with Swagger

## Support

For issues or questions:
1. Check the backend logs
2. Verify environment variables
3. Test API endpoints directly
4. Review the database schema
5. Check network connectivity
