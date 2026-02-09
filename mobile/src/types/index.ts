// Type definitions for the application
export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  type?: string;
  breed: string;
  sex: string;
  birthdate: string;
//  dateOfBirth: string;
//  age: number;
  weight?: number;
  image?: string;
  notes?: string;
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

// Walk tracking types
export interface Coordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number | string;
}

export interface WalkStats {
  distance: number; // meters
  duration: number; // seconds
  averageSpeed: number; // m/s or km/h depending on context
  steps?: number;
}

export interface Walk {
  id: string;
  backendId?: string; // ID from backend after sync
  petId: string;
  petName: string;
  startTime: number;
  endTime?: number;
  distance: number;
  duration: number;
  averageSpeed: number;
  steps: number;
  path: Coordinate[]; // Full coordinate path
  synced?: boolean; // Whether synced to backend
}

export interface WalkSettings {
  enableSync: boolean;
  autoStartOnMovement: boolean;
  trackSteps: boolean;
  syncOnlyOnWifi?: boolean;
  syncedOnce?: boolean; // Track if user has done first-time sync setup
}

// Calendar Event types
export interface CalendarEvent {
  id: number;
  petId: number;
  title: string;
  description?: string;
  date: string;
  eventType: 'vaccination' | 'veterinary' | 'medication' | 'grooming' | 'other';
  completed: boolean;
  notificationEnabled?: boolean;
  notificationTime?: string;
}
