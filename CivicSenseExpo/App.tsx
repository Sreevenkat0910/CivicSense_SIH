import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Alert, Platform, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialMaterialIconss } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import { LoginScreen } from './src/screens/LoginScreen';
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { IssueReportScreen } from './src/screens/IssueReportScreen';
import { MyReportsDashboard } from './src/screens/MyReportsDashboard';
import { NearbyIssuesMap } from './src/screens/NearbyIssuesMap';
import { NotificationPanel } from './src/screens/NotificationPanel';
import { ProfileScreen } from './src/screens/ProfileScreen';

// Types
interface User {
  id: string;
  full_name: string;
  email: string;
  mobile?: string;
  language: string;
}

interface Report {
  id: string;
  title: string;
  category: string;
  status: 'submitted' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  description: string;
  officialResponse?: string;
  upvotes: number;
  reporterEmail?: string;
  userId?: string;
}

interface Issue {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'submitted' | 'in-progress' | 'resolved' | 'closed';
  upvotes: number;
  timestamp: string;
  location: { x: number; y: number };
}

// Navigation Types
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type MainTabParamList = {
  Map: undefined;
  MyReports: undefined;
  ReportIssue: undefined;
  Profile: undefined;
};

type MainStackParamList = {
  MainTabs: undefined;
  IssueReport: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Mock data
const mockReports: Report[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    category: 'Road & Traffic',
    status: 'in-progress',
    priority: 'high',
    timestamp: '2024-01-15T10:30:00Z',
    description: 'Large pothole causing traffic issues',
    officialResponse: 'Work order issued, repair scheduled for next week',
    upvotes: 12,
    reporterEmail: 'test@example.com',
    userId: 'user123',
  },
  {
    id: '2',
    title: 'Broken Street Light',
    category: 'Electricity',
    status: 'resolved',
    priority: 'medium',
    timestamp: '2024-01-10T15:45:00Z',
    description: 'Street light not working for 3 days',
    officialResponse: 'Light repaired and tested',
    upvotes: 8,
    reporterEmail: 'test@example.com',
    userId: 'user123',
  },
  {
    id: '3',
    title: 'Water Leak near Park',
    category: 'Water & Sanitation',
    status: 'submitted',
    priority: 'medium',
    timestamp: '2024-01-12T09:15:00Z',
    description: 'Continuous water leakage near the public park',
    upvotes: 5,
    reporterEmail: 'other@example.com',
    userId: 'user456',
  },
  {
    id: '4',
    title: 'Garbage Collection Issue',
    category: 'Waste Management',
    status: 'in-progress',
    priority: 'low',
    timestamp: '2024-01-14T14:20:00Z',
    description: 'Garbage not collected for 2 days',
    upvotes: 3,
    reporterEmail: 'test@example.com',
    userId: 'user123',
  },
];

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    category: 'Road',
    priority: 'high',
    status: 'in-progress',
    upvotes: 15,
    timestamp: new Date().toISOString(),
    location: { x: 30, y: 40 },
  },
  {
    id: '2',
    title: 'Water Leak',
    category: 'Water',
    priority: 'medium',
    status: 'submitted',
    upvotes: 8,
    timestamp: new Date().toISOString(),
    location: { x: 60, y: 70 },
  },
  {
    id: '3',
    title: 'Broken Bench',
    category: 'Parks',
    priority: 'low',
    status: 'resolved',
    upvotes: 3,
    timestamp: new Date().toISOString(),
    location: { x: 80, y: 20 },
  },
];

const mockNotifications = [
  { id: '1', type: 'update', title: 'Report #12345 Update', message: 'Your report "Pothole on Main Street" is now in progress.', timestamp: new Date().toISOString(), read: false, issueId: '1' },
  { id: '2', type: 'resolved', title: 'Report #67890 Resolved', message: 'Your report "Streetlight not working" has been resolved.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true, issueId: '3' },
  { id: '3', type: 'alert', title: 'New Issue Nearby', message: 'A new high-priority issue has been reported near your location.', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false, issueId: '2' },
  { id: '4', type: 'info', title: 'Welcome to CivicSense', message: 'Thank you for joining our community!', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true, issueId: '2' },
];

// Helper function to get user-specific reports
const getUserReports = (user: User, allReports: any[]) => {
  return allReports.filter(report => {
    return report.reporterEmail === user.email || report.userId === user.id;
  });
};

// Simple Tab Navigator
const MainTabNavigator = ({ user, onLogout }: { user: User; onLogout: () => void }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarMaterialIcons: ({ focused, color, size }) => {
        let iconName: string;
        switch (route.name) {
          case 'Map': iconName = 'map'; break;
          case 'MyReports': iconName = 'assignment'; break;
          case 'ReportIssue': iconName = 'add-circle'; break;
          case 'Profile': iconName = 'person'; break;
          default: iconName = 'map';
        }
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 80 : 60,
      },
    })}
  >
    <Tab.Screen name="Map">
      {() => <NearbyIssuesMap issues={mockIssues} onUpvote={() => {}} />}
    </Tab.Screen>
    <Tab.Screen name="MyReports">
      {() => <MyReportsDashboard reports={getUserReports(user, mockReports)} onViewDetails={() => {}} />}
    </Tab.Screen>
    <Tab.Screen name="ReportIssue">
      {() => <IssueReportScreen />}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {() => <ProfileScreen user={user} onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// Auth Stack Navigator
const AuthNavigator = ({ onLogin, onRegister }: { 
  onLogin: (credentials: { email: string; password: string }) => void;
  onRegister: (userData: any) => void;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(undefined);
    try {
      await onLogin(credentials);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setIsLoading(true);
    setError(undefined);
    try {
      await onRegister(userData);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {() => (
          <LoginScreen
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsLogin(false)}
            onForgotPassword={() => Alert.alert('Forgot Password', 'Password reset coming soon!')}
            error={error}
            isLoading={isLoading}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {() => (
          <RegistrationScreen
            onRegister={handleRegister}
            onSwitchToLogin={() => setIsLogin(true)}
            error={error}
            isLoading={isLoading}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

// Main Stack Navigator
const MainNavigator = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="MainTabs">
          {() => <MainTabNavigator user={user} onLogout={onLogout} />}
        </MainStack.Screen>
        <MainStack.Screen 
          name="IssueReport" 
          component={IssueReportScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Report Issue',
            headerStyle: {
              backgroundColor: '#3b82f6',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />
      </MainStack.Navigator>
      
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={mockNotifications}
        onMarkAsRead={(id) => console.log('Mark as read:', id)}
        onMarkAllAsRead={() => console.log('Mark all as read')}
      />
    </>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('http://192.168.1.8:4000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const loggedInUser: User = {
          id: data.user.user_id,
          full_name: data.user.full_name,
          email: data.user.email,
          mobile: data.user.mobile,
          language: data.user.language,
        };
        await AsyncStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setIsAuthenticated(true);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Network error. Please check your connection.');
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      const response = await fetch('http://192.168.1.8:4000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          language: userData.language || 'English',
          password: userData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newUser: User = {
          id: data.userId,
          full_name: data.fullName,
          email: data.email,
          mobile: data.mobile,
          language: data.language,
        };
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setIsAuthenticated(true);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Network error. Please check your connection.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>CivicSense</Text>
        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main">
              {() => <MainNavigator user={user!} onLogout={handleLogout} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Auth">
              {() => (
                <AuthNavigator onLogin={handleLogin} onRegister={handleRegister} />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;