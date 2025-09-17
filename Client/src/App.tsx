import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { IssueReportForm } from './components/IssueReportForm';
import { NearbyIssuesMap } from './components/NearbyIssuesMap';
import { MyReportsDashboard } from './components/MyReportsDashboard';
import { NotificationPanel } from './components/NotificationPanel';
import { LoginForm } from './components/LoginForm';
import { RegistrationForm } from './components/RegistrationForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { toast, Toaster } from 'sonner@2.0.3';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'submitted' | 'in-progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  location: { x: number; y: number };
  upvotes: number;
  officialResponse?: string;
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

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  language: string;
}

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Main app state
  const [activeTab, setActiveTab] = useState<'report' | 'map' | 'dashboard'>('map');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showNotifications, setShowNotifications] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [userReports, setUserReports] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('civic-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setCurrentLanguage(userData.language || 'en');
      } catch (error) {
        localStorage.removeItem('civic-user');
      }
    }
  }, []);

  // Initialize with mock data (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    const mockIssues: Issue[] = [
      {
        id: '1',
        title: 'Broken streetlight on MG Road',
        description: 'The streetlight has been non-functional for over a week, creating safety concerns.',
        category: 'Electricity',
        status: 'in-progress',
        priority: 'high',
        timestamp: '2024-01-15T10:30:00Z',
        location: { x: 25, y: 35 },
        upvotes: 12,
        officialResponse: 'Issue acknowledged. Repair team has been dispatched.'
      },
      {
        id: '2',
        title: 'Potholes near bus stop',
        description: 'Multiple large potholes making it difficult for vehicles to pass safely.',
        category: 'Road & Traffic',
        status: 'submitted',
        priority: 'medium',
        timestamp: '2024-01-14T14:20:00Z',
        location: { x: 65, y: 50 },
        upvotes: 8
      },
      {
        id: '3',
        title: 'Overflowing garbage bin',
        description: 'Garbage bin near park gate is overflowing, attracting stray animals.',
        category: 'Waste Management',
        status: 'resolved',
        priority: 'medium',
        timestamp: '2024-01-13T09:15:00Z',
        location: { x: 45, y: 70 },
        upvotes: 5,
        officialResponse: 'Garbage has been cleared. Collection frequency increased.'
      },
      {
        id: '4',
        title: 'Water leakage from main pipe',
        description: 'Major water leakage causing road flooding and water wastage.',
        category: 'Water & Sanitation',
        status: 'in-progress',
        priority: 'high',
        timestamp: '2024-01-12T16:45:00Z',
        location: { x: 80, y: 25 },
        upvotes: 15
      },
      {
        id: '5',
        title: 'Park fence needs repair',
        description: 'Children\'s park fence is broken in multiple places.',
        category: 'Parks & Recreation',
        status: 'submitted',
        priority: 'low',
        timestamp: '2024-01-11T11:00:00Z',
        location: { x: 35, y: 60 },
        upvotes: 3
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'update',
        title: 'Issue Update',
        message: 'Your report "Broken streetlight on MG Road" is now in progress.',
        timestamp: '2024-01-15T12:00:00Z',
        read: false,
        issueId: '1'
      },
      {
        id: '2',
        type: 'resolved',
        title: 'Issue Resolved',
        message: 'Your report "Overflowing garbage bin" has been resolved.',
        timestamp: '2024-01-14T15:30:00Z',
        read: false,
        issueId: '3'
      },
      {
        id: '3',
        type: 'alert',
        title: 'Civic Alert',
        message: 'Water supply will be disrupted tomorrow from 9 AM to 2 PM in your area.',
        timestamp: '2024-01-13T18:00:00Z',
        read: true
      },
      {
        id: '4',
        type: 'info',
        title: 'New Feature',
        message: 'You can now add voice notes to your issue reports!',
        timestamp: '2024-01-12T10:00:00Z',
        read: true
      }
    ];

    setIssues(mockIssues);
    setUserReports([mockIssues[0], mockIssues[2]]); // User's own reports
    setNotifications(mockNotifications);
  }, [isAuthenticated]);

  const handleIssueSubmit = (newIssue: any) => {
    const issue: Issue = {
      ...newIssue,
      location: { x: Math.random() * 80 + 10, y: Math.random() * 60 + 20 }
    };
    
    setIssues(prev => [issue, ...prev]);
    setUserReports(prev => [issue, ...prev]);
    
    // Add notification
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'info',
      title: 'Report Submitted',
      message: `Your report "${issue.title}" has been successfully submitted.`,
      timestamp: new Date().toISOString(),
      read: false,
      issueId: issue.id
    };
    setNotifications(prev => [notification, ...prev]);
    
    toast.success('Issue reported successfully!');
    setActiveTab('dashboard');
  };

  const handleUpvote = (issueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, upvotes: issue.upvotes + 1 }
        : issue
    ));
    setUserReports(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, upvotes: issue.upvotes + 1 }
        : issue
    ));
    toast.success('Thank you for your support!');
  };

  const handleViewDetails = (report: Issue) => {
    toast.info(`Viewing details for: ${report.title}`);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  // Authentication handlers
  const handleLogin = async (credentials: { email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful login - in real app, this would validate against backend
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        const userData: User = {
          id: '1',
          name: 'Demo User',
          email: credentials.email,
          language: 'en'
        };

        setUser(userData);
        setIsAuthenticated(true);
        setCurrentLanguage(userData.language);
        localStorage.setItem('civic-user', JSON.stringify(userData));
        toast.success('Welcome back!');
      } else {
        setAuthError('Invalid email or password. Try demo@example.com / password');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
    language: string;
  }) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful registration
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        language: userData.language
      };

      setUser(newUser);
      setIsAuthenticated(true);
      setCurrentLanguage(userData.language);
      localStorage.setItem('civic-user', JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (error) {
      setAuthError('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful password reset request
      setForgotPasswordSuccess(true);
      toast.success('Password reset instructions sent!');
    } catch (error) {
      setAuthError('Failed to send reset instructions. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentLanguage('en');
    localStorage.removeItem('civic-user');
    toast.success('Signed out successfully');
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    if (user) {
      const updatedUser = { ...user, language };
      setUser(updatedUser);
      localStorage.setItem('civic-user', JSON.stringify(updatedUser));
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Show authentication forms if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setAuthView('register');
            setAuthError('');
          }}
          onForgotPassword={() => {
            setAuthView('forgot-password');
            setAuthError('');
            setForgotPasswordSuccess(false);
          }}
          error={authError}
          isLoading={authLoading}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegistrationForm
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setAuthView('login');
            setAuthError('');
          }}
          error={authError}
          isLoading={authLoading}
        />
      );
    }

    if (authView === 'forgot-password') {
      return (
        <ForgotPasswordForm
          onSendReset={handleForgotPassword}
          onBackToLogin={() => {
            setAuthView('login');
            setAuthError('');
            setForgotPasswordSuccess(false);
          }}
          error={authError}
          success={forgotPasswordSuccess}
          isLoading={authLoading}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        notificationCount={unreadNotificationCount}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        user={user}
        onLogout={handleLogout}
      />
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        <div className="relative">
          {/* Main Content */}
          <div className={`transition-all duration-300 ${showNotifications ? 'lg:mr-96' : ''}`}>
            {activeTab === 'report' && (
              <div className="max-w-2xl mx-auto">
                <IssueReportForm onSubmit={handleIssueSubmit} />
              </div>
            )}
            
            {activeTab === 'map' && (
              <NearbyIssuesMap 
                issues={issues} 
                onUpvote={handleUpvote}
                onReportIssue={() => setActiveTab('report')}
              />
            )}
            
            {activeTab === 'dashboard' && (
              <MyReportsDashboard 
                reports={userReports} 
                onViewDetails={handleViewDetails} 
              />
            )}
          </div>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="fixed right-0 top-0 bottom-0 w-96 lg:absolute lg:top-0 lg:bottom-auto lg:h-auto z-40">
              <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>
          )}
        </div>
      </main>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}