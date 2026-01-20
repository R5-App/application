// Authentication Context
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  deleteAccount: (userId: string, password: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication on app start
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = await authService.initAuth();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || 'Kirjautuminen epäonnistui' };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Kirjautuminen epäonnistui',
      };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      }
      return {
        success: false,
        message: response.message || response.errors?.join(', ') || 'Rekisteröinti epäonnistui',
      };
    } catch (error: any) {
      console.error('Register error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.join(', ')
        || error.message 
        || 'Rekisteröinti epäonnistui';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const deleteAccount = async (userId: string, password: string) => {
    try {
      const result = await authService.deleteAccount(userId, password);
      if (result.success) {
        setUser(null);
      }
      return result;
    } catch (error: any) {
      console.error('Delete account error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Tilin poisto epäonnistui',
      };
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        deleteAccount,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
