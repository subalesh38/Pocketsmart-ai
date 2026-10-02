import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const apiUser = await authApi.me();
      setUser({
        username: apiUser.username,
        email: apiUser.email,
        name: apiUser.username,
      });
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    
    // Listen for unauthorized events to automatically logout
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = (email: string, name?: string) => {
    // This is called by the UI after a successful API login
    // We just trigger a refreshUser to pull the profile
    refreshUser();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      setUser(null);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
