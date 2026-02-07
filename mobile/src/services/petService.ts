// Pet service for backend communication
import apiClient from './api';
import { Pet } from '../types';

export interface PetResponse {
  id: number;
  owner_id: string;
  name: string;
  type: string;
  breed: string;
  sex: string;
  birthdate: string;
  notes?: string;
  age_years?: number;
  created_at: string;
}

export const petService = {
  /**
   * Get all user's pets (owned and shared)
   */
  async getUserPets(): Promise<{ success: boolean; pets?: PetResponse[]; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: PetResponse[]; count: number }>(
        '/api/pets'
      );

      if (response.data.success) {
        return { success: true, pets: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Get user pets error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lemmikkien haku epäonnistui',
      };
    }
  },

  /**
   * Get complete pet data including all records
   */
  async getCompletePetData(petId: number): Promise<{ success: boolean; pet?: any; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: any }>(
        `/api/pets/${petId}/complete`
      );

      if (response.data.success) {
        return { success: true, pet: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Get complete pet data error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lemmikin tietojen haku epäonnistui',
      };
    }
  },

  /**
   * Create a new pet
   */
  async createPet(petData: { name: string; type?: string; breed?: string; birthdate?: string; sex?: string; notes?: string }): Promise<{ success: boolean; pet?: PetResponse; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: PetResponse }>(
        '/api/pets',
        petData
      );

      if (response.data.success) {
        return { success: true, pet: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Create pet error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lemmikin luonti epäonnistui',
      };
    }
  },

  /**
   * Delete a pet
   */
  async deletePet(petId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `/api/pets/${petId}`
      );

      return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
      console.error('Delete pet error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lemmikin poisto epäonnistui',
      };
    }
  },

  /**
   * Convert backend pet to app Pet format
   */
  convertToAppPet(backendPet: PetResponse): Pet {
    const birthdate = new Date(backendPet.birthdate);
    const age = new Date().getFullYear() - birthdate.getFullYear();

    return {
      id: backendPet.id,
      name: backendPet.name,
      type: backendPet.type,
      breed: backendPet.breed || 'Tuntematon',
      age: backendPet.age_years || age,
      weight: 0, // Weight needs to be fetched separately
      dateOfBirth: backendPet.birthdate,
    };
  },
};

export default petService;
