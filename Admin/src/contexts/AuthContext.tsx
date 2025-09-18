import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '../services/api';

interface User {
  user_id: string;
  full_name: string;
  email: string;
  mobile?: string;
  language: string;
  usertype_id: number;
  department?: string;
  mandal_area?: string;
  is_active: boolean;
  user_types?: {
    usertype_id: number;
    type_name: string;
    description: string;
    permissions: string[];
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('civicsense_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        ApiService.setToken(token);
        try {
          const response = await ApiService.verifyToken();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(email, password);
      
      if (response.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('civicsense_token', newToken);
        ApiService.setToken(newToken);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('civicsense_token');
    ApiService.setToken('');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await ApiService.verifyToken();
        if (response.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
