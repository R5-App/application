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
