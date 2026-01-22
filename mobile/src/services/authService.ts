// Authentication service
import apiClient from './api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const USER_KEY = 'user_data';
const TOKEN_VALIDITY_DAYS = 7;

export const authService = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.data.success && response.data.data?.token) {
      await authService.saveToken(response.data.data.token);
      await authService.saveUser(response.data.data.user);
    }
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    if (response.data.success && response.data.data?.token) {
      await authService.saveToken(response.data.data.token);
      await authService.saveUser(response.data.data.user);
    }
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await authService.clearToken();
      await authService.clearUser();
    }
  },

  // Delete user account
  deleteAccount: async (userId: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      await apiClient.delete(`/api/auth/account/${userId}`, {
        data: { password }
      });
      // Clear local data after successful deletion
      await authService.clearToken();
      await authService.clearUser();
      return { success: true, message: 'Tili poistettu onnistuneesti' };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return {
        success: false,
        message: 'Tilin poisto epäonnistui',
      };
    }
  },

  // Get sub-users for the authenticated user's account
  getSubUsers: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    try {
      const response = await apiClient.get('/api/auth/sub-users');
      
      // Handle different response formats
      let subUsersData = [];
      if (response.data.success && response.data.data?.subUsers) {
        subUsersData = response.data.data.subUsers;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        subUsersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        subUsersData = response.data;
      } else if (response.data.subUsers) {
        subUsersData = response.data.subUsers;
      }
      
      return {
        success: true,
        data: subUsersData,
      };
    } catch (error: any) {
      console.error('Get sub-users error:', error);
      return {
        success: false,
        data: [],
        message: 'Alikäyttäjien haku epäonnistui',
      };
    }
  },

  // Remove/unlink a sub-user from the account
  deleteSubUser: async (subUserId: string): Promise<{ success: boolean; message: string }> => {
    try {
      await apiClient.delete(`/api/auth/sub-user/${subUserId}`);
      return {
        success: true,
        message: 'Alikäyttäjä poistettu onnistuneesti',
      };
    } catch (error: any) {
      console.error('Delete sub-user error:', error);
      return {
        success: false,
        message: 'Alikäyttäjän poisto epäonnistui',
      };
    }
  },

  // Update sub-user role
  updateSubUserRole: async (subUserId: string, role: string): Promise<{ success: boolean; message: string }> => {
    try {
      await apiClient.put(`/api/auth/sub-user/${subUserId}/role`, { role });
      return {
        success: true,
        message: 'Rooli päivitetty onnistuneesti',
      };
    } catch (error: any) {
      console.error('Update sub-user role error:', error);
      return {
        success: false,
        message: 'Roolin päivitys epäonnistui',
      };
    }
  },

  // Update user email
  updateEmail: async (newEmail: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const response = await apiClient.put('/api/auth/email', { email: newEmail });
      if (response.data.success && response.data.data?.user) {
        // Merge with existing user data to preserve fields like created_at
        const existingUser = await authService.getUser();
        const updatedUser = { ...existingUser, ...response.data.data.user };
        await authService.saveUser(updatedUser);
        return { 
          success: true, 
          message: 'Sähköposti päivitetty onnistuneesti',
          user: updatedUser
        };
      }
      return {
        success: false,
        message: 'Sähköpostin päivitys epäonnistui',
      };
    } catch (error: any) {
      console.error('Update email error:', error);
      return {
        success: false,
        message: 'Sähköpostin päivitys epäonnistui',
      };
    }
  },

  // Update user password
  updatePassword: async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.put('/api/auth/password', { 
        oldPassword, 
        newPassword 
      });
      if (response.data.success) {
        return { 
          success: true, 
          message: 'Salasana päivitetty onnistuneesti'
        };
      }
      return {
        success: false,
        message: 'Salasanan päivitys epäonnistui',
      };
    } catch (error: any) {
      console.error('Update password error:', error);
      return {
        success: false,
        message: 'Salasanan päivitys epäonnistui',
      };
    }
  },

  // Token management
  saveToken: async (token: string): Promise<void> => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TOKEN_VALIDITY_DAYS);
    
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  isTokenValid: async (): Promise<boolean> => {
    const expiryDateStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryDateStr) {
      return false;
    }
    
    const expiryDate = new Date(expiryDateStr);
    const now = new Date();
    return now < expiryDate;
  },

  clearToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
  },

  // User data management
  saveUser: async (user: User): Promise<void> => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: async (): Promise<User | null> => {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  clearUser: async (): Promise<void> => {
    await AsyncStorage.removeItem(USER_KEY);
  },

  // Initialize auth (call on app start)
  initAuth: async (): Promise<User | null> => {
    const token = await authService.getToken();
    const isValid = await authService.isTokenValid();
    
    if (token && isValid) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return await authService.getUser();
    } else if (token && !isValid) {
      // Token on vanhentunut, poistetaan se
      await authService.clearToken();
      await authService.clearUser();
    }
    
    return null;
  },
};

export default authService;
