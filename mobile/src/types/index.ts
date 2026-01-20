// Type definitions for the application
export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  image?: string;
  dateOfBirth: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  created_at?: string;
  createdAt?: string;
  role?: 'admin' | 'member';
}

export interface SubUser extends User {
  parentUserId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'checkup' | 'medication';
  date: string;
  notes?: string;
}
