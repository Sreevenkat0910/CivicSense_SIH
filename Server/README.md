# CivicSense Backend API

A comprehensive Node.js/Express backend API for the CivicSense civic issue reporting platform.

## Features

- **Authentication System**: JWT-based authentication with role-based access control
- **Report Management**: Full CRUD operations for civic issue reports
- **User Management**: User registration, profile management, and role-based permissions
- **Notification System**: Real-time notifications for users
- **Schedule Management**: Calendar and scheduling functionality
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **File Upload**: Image and document upload with validation
- **Database Integration**: Supabase PostgreSQL integration

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `GET /verify` - Verify JWT token
- `POST /logout` - User logout

### Reports (`/api/reports`)
- `GET /` - Get all reports (with filtering and pagination)
- `GET /:id` - Get specific report
- `POST /` - Create new report
- `PATCH /:id/status` - Update report status
- `GET /user/:userId` - Get user's reports
- `GET /nearby` - Get nearby reports by location
- `POST /upload-photos` - Upload report photos

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:userId` - Get user profile
- `PATCH /:userId` - Update user profile
- `PATCH /:userId/password` - Change password
- `PATCH /:userId/status` - Activate/deactivate user
- `GET /stats/overview` - Get user statistics

### User Types (`/api/usertypes`)
- `GET /` - Get all user types

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `PATCH /:id/read` - Mark notification as read
- `PATCH /mark-all-read` - Mark all notifications as read
- `DELETE /:id` - Delete notification
- `POST /` - Create notification (admin)
- `GET /stats` - Get notification statistics

### Schedules (`/api/schedules`)
- `GET /` - Get user schedules
- `GET /:id` - Get specific schedule
- `POST /` - Create schedule
- `PATCH /:id` - Update schedule
- `DELETE /:id` - Delete schedule
- `GET /calendar/:startDate/:endDate` - Get calendar schedules
- `GET /upcoming` - Get upcoming schedules

### Analytics (`/api/analytics`)
- `GET /overview` - Get dashboard overview statistics
- `GET /departments` - Get department-wise statistics
- `GET /mandal-areas` - Get mandal area statistics
- `GET /trends` - Get trend data for charts
- `GET /performance` - Get performance metrics

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the Server directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://192.168.1.8:3000,http://192.168.1.8:8080
```

### 2. Database Setup

1. Set up a Supabase project
2. Run the SQL schema files in the `src/sql/` directory:
   - `schema.sql` - Main database schema
   - `database_improvements.sql` - Additional improvements
   - `supabase_sample_data.sql` - Sample data

### 3. Install Dependencies

```bash
cd Server
npm install
```

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:4000`

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **admin**: Full system access
- **mandal-admin**: Mandal-level administration
- **department**: Department head access
- **citizen**: Basic citizen access

## File Upload

The API supports file uploads for report photos. Files are stored in the `uploads/photos/` directory and served statically at `/uploads/photos/`.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Pagination

List endpoints support pagination with query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Rate Limiting

Consider implementing rate limiting for production use.

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention through Supabase

## Development

### Project Structure

```
Server/
├── src/
│   ├── routes/          # API route handlers
│   ├── lib/            # Database and external service connections
│   ├── models/         # Data models (Mongoose schemas)
│   ├── utils/          # Utility functions
│   ├── data/           # Mock data for development
│   └── sql/            # Database schema files
├── uploads/            # File upload directory
└── package.json
```

### Adding New Endpoints

1. Create route handler in `src/routes/`
2. Add route to main server file (`src/index.js`)
3. Update API service in frontend
4. Add proper authentication middleware if needed
5. Include error handling and validation

## Testing

Test the API endpoints using tools like Postman or curl:

```bash
# Health check
curl http://localhost:4000/api/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@civicsense.com","password":"admin123"}'
```

## Production Deployment

1. Set production environment variables
2. Use a process manager like PM2
3. Set up reverse proxy with Nginx
4. Configure SSL certificates
5. Set up monitoring and logging
6. Implement backup strategies

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints thoroughly