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
  avatar?: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'checkup' | 'medication';
  date: string;
  notes?: string;
}
