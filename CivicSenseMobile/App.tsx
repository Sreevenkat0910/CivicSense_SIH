import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

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

interface Notification {
  id: string;
  type: 'update' | 'alert' | 'info' | 'resolved';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  issueId?: string;
}

// Navigation types
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
  },
];

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    category: 'Road & Traffic',
    priority: 'high',
    status: 'in-progress',
    upvotes: 12,
    timestamp: '2024-01-15T10:30:00Z',
    location: { x: 30, y: 40 },
  },
  {
    id: '2',
    title: 'Broken Street Light',
    category: 'Electricity',
    priority: 'medium',
    status: 'resolved',
    upvotes: 8,
    timestamp: '2024-01-10T15:45:00Z',
    location: { x: 60, y: 25 },
  },
  {
    id: '3',
    title: 'Garbage Not Collected',
    category: 'Waste Management',
    priority: 'low',
    status: 'submitted',
    upvotes: 5,
    timestamp: '2024-01-12T09:15:00Z',
    location: { x: 45, y: 70 },
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'update',
    title: 'Issue Update',
    message: 'Your pothole report is now being processed',
    timestamp: '2024-01-15T11:00:00Z',
    read: false,
    issueId: '1',
  },
  {
    id: '2',
    type: 'resolved',
    title: 'Issue Resolved',
    message: 'Your street light report has been fixed',
    timestamp: '2024-01-11T16:00:00Z',
    read: true,
    issueId: '2',
  },
];

// Custom transition animations
const slideFromRight = {
  cardStyleInterpolator: ({ current, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

const slideFromBottom = {
  cardStyleInterpolator: ({ current, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    };
  },
};

const fadeTransition = {
  cardStyleInterpolator: ({ current }: any) => {
    return {
      cardStyle: {
        opacity: current.progress,
      },
    };
  },
};

// Animated Tab Bar Component
const AnimatedTabBar = ({ state, descriptors, navigation }: any) => {
  const tabBarHeight = useSharedValue(60);
  const tabBarOpacity = useSharedValue(1);

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      height: tabBarHeight.value,
      opacity: tabBarOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.tabBarContainer, animatedTabBarStyle]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <AnimatedTabButton
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            label={label}
            iconName={getTabIcon(route.name)}
          />
        );
      })}
    </Animated.View>
  );
};

const AnimatedTabButton = ({ isFocused, label, iconName, onPress }: any) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(isFocused ? 1 : 0.6, { duration: 200 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.tabButton, animatedStyle]}>
      <Animated.View style={styles.tabButtonContent}>
        <Icon 
          name={iconName} 
          size={24} 
          color={isFocused ? '#3b82f6' : '#6b7280'} 
        />
        <Animated.Text style={[
          styles.tabLabel,
          { color: isFocused ? '#3b82f6' : '#6b7280' }
        ]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const getTabIcon = (routeName: string) => {
  switch (routeName) {
    case 'Map': return 'map';
    case 'MyReports': return 'assignment';
    case 'ReportIssue': return 'add-circle';
    case 'Profile': return 'person';
    default: return 'map';
  }
};

// Auth Stack Navigator with animations
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
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        ...slideFromRight,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
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

// Main Tab Navigator with animations
const MainTabNavigator = ({ user, onLogout }: { user: User; onLogout: () => void }) => (
  <Tab.Navigator
    tabBar={(props) => <AnimatedTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        height: Platform.OS === 'ios' ? 80 : 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      },
    }}
  >
    <Tab.Screen 
      name="Map" 
      component={() => <NearbyIssuesMap issues={mockIssues} onUpvote={() => {}} />} 
    />
    <Tab.Screen 
      name="MyReports" 
      component={() => <MyReportsDashboard reports={mockReports} onViewDetails={() => {}} />} 
    />
    <Tab.Screen 
      name="ReportIssue" 
      component={() => <IssueReportScreen />} 
    />
    <Tab.Screen 
      name="Profile" 
      component={() => <ProfileScreen user={user} onLogout={onLogout} />} 
    />
  </Tab.Navigator>
);

// Main Stack Navigator with animations
const MainNavigator = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <MainStack.Navigator 
        screenOptions={{ 
          headerShown: false,
          ...slideFromRight,
          gestureEnabled: true,
        }}
      >
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
            ...slideFromBottom,
            gestureEnabled: true,
            gestureDirection: 'vertical',
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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      // Mock login - replace with actual API call
      const mockUser: User = {
        id: '1',
        full_name: 'John Doe',
        email: credentials.email,
        mobile: '+1234567890',
        language: 'en',
      };

      await AsyncStorage.setItem('authToken', 'mock-token');
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (userData: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
    language: string;
  }) => {
    try {
      // Mock registration - replace with actual API call
      const newUser: User = {
        id: Date.now().toString(),
        full_name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        language: userData.language,
      };

      await AsyncStorage.setItem('authToken', 'mock-token');
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            ...fadeTransition,
            gestureEnabled: false,
          }}
        >
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

const styles = {
  tabBarContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
  },
  tabButtonContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginTop: 4,
  },
};

export default App;