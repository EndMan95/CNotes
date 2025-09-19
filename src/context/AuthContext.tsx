'use client';

import * as React from 'react';
import apiClient from '../lib/services/apiClient';

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
        apiClient.setToken(storedToken);
      } catch (error) {
        // If parsing fails, clear the invalid data
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.login(email, password);
      
      // Update state
      setCurrentUser(response.user);
      setToken(response.token);
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Set token in apiClient
      apiClient.setToken(response.token);
    } catch (error) {
      // Re-throw the error so it can be handled by the caller
      throw error;
    }
  };

  const logout = (): void => {
    // Clear state
    setCurrentUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear token in apiClient
    apiClient.clearToken();
  };

  const isAuthenticated = !!token && !!currentUser;

  const value = {
    currentUser,
    token,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};