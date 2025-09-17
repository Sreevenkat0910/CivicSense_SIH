# CivicSense Mobile App

A React Native mobile application for reporting civic issues in your community with smooth animations and modern mobile UI/UX.

## ✨ Features

### Core Functionality
- **User Authentication**: Login and registration with secure password handling
- **Issue Reporting**: Report civic issues with photos, location, and voice notes
- **My Reports**: Track the progress of your submitted issues
- **Nearby Issues Map**: View and upvote issues in your area
- **Notifications**: Get updates on your reports and community issues
- **Profile Management**: Manage your account settings and preferences

### 🎨 Mobile UI/UX Enhancements
- **Smooth Animations**: React Native Reanimated for fluid transitions
- **Gradient Backgrounds**: Linear gradients for modern visual appeal
- **Touch Interactions**: Haptic feedback and button press animations
- **Gesture Navigation**: Swipe gestures and native navigation patterns
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Accessibility**: Screen reader support and proper touch targets

## 🚀 Animation Features

### Screen Transitions
- **Slide Animations**: Horizontal and vertical slide transitions
- **Fade Transitions**: Smooth opacity changes between screens
- **Spring Animations**: Natural, physics-based animations
- **Staggered Animations**: Sequential element animations for better UX

### Component Animations
- **Entrance Animations**: Elements animate in with scale and translate effects
- **Button Press**: Scale animations on touch for tactile feedback
- **Progress Bars**: Animated progress indicators with smooth transitions
- **Photo Upload**: Scale animations when photos are added/removed
- **Modal Presentations**: Slide-up modals with backdrop animations

### Interactive Elements
- **Tab Bar**: Animated tab switching with scale and color transitions
- **Input Fields**: Focus animations and error state transitions
- **Cards**: Hover-like effects and shadow animations
- **Lists**: Staggered item animations for smooth loading

## 📱 Screens

### Authentication
- **Login Screen**: 
  - Gradient background with animated logo
  - Staggered form field animations
  - Button press feedback
  - Error state animations
- **Registration Screen**: 
  - Modal language picker with slide animations
  - Form validation with animated error states
  - Password strength indicators

### Main App
- **Home Tab**: 
  - Animated dashboard cards
  - Progress bar animations
  - Staggered list item loading
- **Reports Tab**: 
  - Detailed report cards with priority indicators
  - Animated status badges
  - Smooth progress tracking
- **Map Tab**: 
  - Interactive map markers with touch animations
  - Animated issue details panel
  - Smooth modal transitions
- **Profile Tab**: 
  - Animated profile header
  - Settings options with touch feedback
  - Logout confirmation with animations

### Additional Screens
- **Issue Report**: 
  - Step-by-step form with entrance animations
  - Camera integration with photo preview animations
  - Voice recording with visual feedback
  - Category selection modal with smooth transitions
- **Notifications**: 
  - Slide-up modal with backdrop blur
  - Animated notification items
  - Mark as read animations

## 🎯 Mobile-Specific Features

### Native Integrations
- **Camera**: Native camera with photo preview and editing
- **Location Services**: GPS location with animated markers
- **Touch Gestures**: Swipe, tap, long-press interactions
- **Haptic Feedback**: Vibration feedback for actions
- **Push Notifications**: Real-time updates (coming soon)

### Performance Optimizations
- **Optimized Images**: Proper sizing and caching
- **Efficient Lists**: FlatList with optimized rendering
- **Memory Management**: Proper component cleanup
- **Smooth Scrolling**: 60fps animations with Reanimated

### Accessibility
- **Screen Reader**: VoiceOver/TalkBack support
- **High Contrast**: Good color contrast ratios
- **Touch Targets**: Minimum 44pt touch targets
- **Keyboard Navigation**: Proper focus management

## 🛠 Technical Stack

### Core Technologies
- **React Native 0.81.4**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation 6**: Screen navigation and routing
- **React Native Reanimated**: High-performance animations
- **React Native Gesture Handler**: Touch gesture management

### UI/UX Libraries
- **React Native Vector Icons**: Material Design icons
- **React Native Linear Gradient**: Gradient backgrounds
- **React Native Safe Area Context**: Safe area handling
- **React Native Blur**: Background blur effects

### Data & Storage
- **AsyncStorage**: Local data persistence
- **React Native Image Picker**: Camera and gallery integration
- **React Native Geolocation**: Location services
- **React Native Permissions**: Permission management

## 🎨 Design System

### Colors
- **Primary**: #3b82f6 (Blue)
- **Secondary**: #1d4ed8 (Dark Blue)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #ef4444 (Red)
- **Neutral**: #6b7280 (Gray)

### Typography
- **Headings**: 28px, 24px, 20px, 18px
- **Body**: 16px, 14px
- **Captions**: 12px, 10px
- **Weights**: 700 (Bold), 600 (SemiBold), 500 (Medium)

### Spacing
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **Extra Large**: 32px

### Shadows & Elevation
- **Card Shadow**: 0 4px 12px rgba(0,0,0,0.1)
- **Button Shadow**: 0 2px 8px rgba(0,0,0,0.15)
- **Modal Shadow**: 0 8px 32px rgba(0,0,0,0.2)

## 📦 Installation

1. **Prerequisites**:
   ```bash
   # Node.js (v16 or higher)
   npm install -g react-native-cli
   
   # iOS (macOS only)
   sudo gem install cocoapods
   
   # Android
   # Install Android Studio and SDK
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   
   # iOS (macOS only)
   cd ios && pod install && cd ..
   ```

3. **Run the App**:
   ```bash
   # Android
   npx react-native run-android
   
   # iOS
   npx react-native run-ios
   ```

## 🏗 Project Structure

```
src/
├── screens/                    # All screen components
│   ├── LoginScreen.tsx         # Animated login with gradients
│   ├── RegistrationScreen.tsx  # Registration with modal picker
│   ├── IssueReportScreen.tsx   # Form with staggered animations
│   ├── MyReportsDashboard.tsx  # Cards with progress animations
│   ├── NearbyIssuesMap.tsx     # Interactive map with markers
│   ├── NotificationPanel.tsx   # Slide-up modal
│   └── ProfileScreen.tsx      # Profile with settings
├── components/                 # Reusable animated components
│   ├── AnimatedInputField.tsx  # Input with focus animations
│   ├── AnimatedButton.tsx      # Button with press feedback
│   ├── AnimatedCard.tsx        # Card with hover effects
│   └── AnimatedModal.tsx       # Modal with backdrop blur
└── App.tsx                    # Main app with navigation setup
```

## 🎭 Animation Patterns

### Entrance Animations
```typescript
// Staggered entrance
const translateY = useSharedValue(30);
const opacity = useSharedValue(0);

useEffect(() => {
  translateY.value = withTiming(0, { duration: 400, delay: index * 100 });
  opacity.value = withTiming(1, { duration: 400, delay: index * 100 });
}, []);
```

### Button Press Feedback
```typescript
// Scale animation on press
const scale = useSharedValue(1);

const handlePress = () => {
  scale.value = withSequence(
    withTiming(0.95, { duration: 100 }),
    withTiming(1, { duration: 100 })
  );
};
```

### Progress Animations
```typescript
// Animated progress bar
const progressWidth = useSharedValue(0);

useEffect(() => {
  progressWidth.value = withTiming(progress, { duration: 1000 });
}, [progress]);
```

## 🔧 Configuration

### Animation Settings
- **Spring Damping**: 15 (natural feel)
- **Spring Stiffness**: 150 (responsive)
- **Timing Duration**: 400ms (standard)
- **Delay Increment**: 100ms (staggered)

### Performance Settings
- **Use Native Driver**: true (for transform/opacity)
- **Run on JS Thread**: false (for better performance)
- **Gesture Handler**: Enabled for smooth interactions

## 🚀 Future Enhancements

### Planned Features
- **Push Notifications**: Real-time issue updates with animations
- **Dark Mode**: Theme switching with smooth transitions
- **Biometric Auth**: Fingerprint/Face ID with animations
- **AR Features**: Augmented reality for issue visualization
- **Voice Commands**: Voice-to-text with visual feedback
- **Offline Mode**: Full offline functionality with sync animations

### Animation Improvements
- **Lottie Animations**: Custom animated illustrations
- **Particle Effects**: Visual feedback for actions
- **3D Transitions**: Depth-based navigation
- **Micro-interactions**: Subtle feedback animations

## 📱 Platform Differences

### iOS
- **Navigation**: Native iOS navigation patterns
- **Animations**: Core Animation integration
- **Gestures**: iOS-specific gesture recognizers
- **Safe Areas**: Proper safe area handling

### Android
- **Material Design**: Google Material Design guidelines
- **Animations**: Android transition animations
- **Gestures**: Android-specific touch handling
- **Permissions**: Android permission system

## 🎯 Performance Metrics

### Target Performance
- **60 FPS**: Smooth animations throughout
- **< 100ms**: Touch response time
- **< 500ms**: Screen transition time
- **< 1s**: App startup time

### Optimization Techniques
- **Native Driver**: Use native driver for animations
- **Lazy Loading**: Load screens on demand
- **Image Optimization**: Compress and cache images
- **Memory Management**: Proper cleanup and garbage collection

## 🤝 Contributing

### Animation Guidelines
1. **Consistency**: Use consistent timing and easing
2. **Performance**: Always use native driver when possible
3. **Accessibility**: Ensure animations don't interfere with accessibility
4. **Testing**: Test on both iOS and Android devices
5. **Documentation**: Document custom animation patterns

### Code Standards
- **TypeScript**: Use strict typing for all components
- **Performance**: Optimize for 60fps animations
- **Accessibility**: Include proper accessibility props
- **Testing**: Write tests for animation behaviors

## 📄 License

This project is part of the CivicSense platform for civic issue reporting with enhanced mobile animations and modern UI/UX design.