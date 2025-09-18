# CivicSense Mobile App

A Flutter mobile application for civic reporting that allows citizens to report and track issues in their local community.

## Features

- **User Authentication**: Login and registration with email/password or Google Sign-In
- **Issue Reporting**: Report civic issues with photos, location, and detailed descriptions
- **Issue Categories**: Categorize issues (Road, Water, Electricity, Sanitation, etc.)
- **Location Services**: Automatic location detection and nearby issue discovery
- **Issue Tracking**: View and track your submitted reports
- **Community Engagement**: Upvote issues and see community reports
- **Modern UI**: Clean, minimal design with black and white theme

## Screens

1. **Login Screen**: Email/password authentication with Google Sign-In option
2. **Registration Screen**: Create new account with validation
3. **Home Screen**: Dashboard with quick actions and recent issues
4. **Report Issue Screen**: Submit new issues with photos and location
5. **My Reports Screen**: View and track your submitted issues
6. **Nearby Issues Screen**: Discover issues reported near your location
7. **Profile Screen**: User profile and app settings

## Tech Stack

- **Flutter**: Cross-platform mobile development
- **Provider**: State management
- **Go Router**: Navigation and routing
- **HTTP**: API communication
- **Shared Preferences**: Local storage
- **Geolocator**: Location services
- **Image Picker**: Camera and gallery access
- **Google Sign-In**: Authentication

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/
│   └── issue.dart           # Data models
├── providers/
│   ├── auth_provider.dart   # Authentication state
│   └── issue_provider.dart  # Issue management state
├── screens/
│   ├── login_screen.dart
│   ├── registration_screen.dart
│   ├── home_screen.dart
│   ├── report_issue_screen.dart
│   ├── my_reports_screen.dart
│   ├── nearby_issues_screen.dart
│   └── profile_screen.dart
├── widgets/
│   └── issue_list_item.dart # Reusable UI components
└── services/
    └── api_service.dart     # Backend API integration
```

## Getting Started

### Prerequisites

- Flutter SDK (3.5.4 or higher)
- Dart SDK
- Android Studio / Xcode (for mobile development)
- Backend server running on localhost:3000

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd civic_sense_mobile
   ```

3. Install dependencies:
   ```bash
   flutter pub get
   ```

4. Run the app:
   ```bash
   flutter run
   ```

### Backend Integration

The app is designed to work with a Node.js backend server. Update the `baseUrl` in `lib/services/api_service.dart` to point to your backend server.

## Features Implementation

### Authentication
- Email/password login and registration
- Google Sign-In integration
- Persistent login state
- Secure token management

### Issue Management
- Create issues with photos and location
- Categorize issues by type
- Track issue status and progress
- Community upvoting system

### Location Services
- Automatic current location detection
- Nearby issue discovery
- Address geocoding
- Distance calculations

### UI/UX
- Material Design components
- Responsive layout
- Dark/light theme support
- Intuitive navigation
- Loading states and error handling

## API Endpoints

The app expects the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/issues` - Get all issues
- `GET /api/issues/user/:userId` - Get user's issues
- `POST /api/issues` - Submit new issue
- `POST /api/issues/:id/upvote` - Upvote issue
- `GET /api/issues/nearby` - Get nearby issues
- `POST /api/upload` - Upload images

## Development

### State Management
The app uses Provider for state management with two main providers:
- `AuthProvider`: Handles user authentication and profile data
- `IssueProvider`: Manages issue data and operations

### Navigation
Go Router is used for declarative navigation with route guards for authentication.

### Error Handling
Comprehensive error handling with user-friendly messages and fallback states.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.