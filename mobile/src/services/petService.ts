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
   * Get a single pet by ID
   */
  async getPetById(petId: string | number): Promise<{ success: boolean; data?: Pet; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: PetResponse }>(
        `/api/pets/${petId}`
      );

      if (response.data.success && response.data.data) {
        // Convert PetResponse to Pet with string ID
        const petData = response.data.data;
        const convertedPet: Pet = {
          id: String(petData.id),
          owner_id: petData.owner_id,
          name: petData.name,
          type: petData.type,
          breed: petData.breed,
          sex: petData.sex,
          birthdate: petData.birthdate,
          notes: petData.notes
        };
        return { success: true, data: convertedPet };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Get pet by ID error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lemmikin haku epäonnistui',
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
   * Update a pet's information
   */
  async updatePet(petId: string | number, petData: { name?: string; type?: string; breed?: string; birthdate?: string; sex?: string; notes?: string }): Promise<{ success: boolean; data?: Pet; message?: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; message: string; data: PetResponse }>(
        `/api/pets/${petId}`,
        petData
      );

      if (response.data.success && response.data.data) {
        // Convert PetResponse to Pet with string ID
        const petData = response.data.data;
        const convertedPet: Pet = {
          id: String(petData.id),
          owner_id: petData.owner_id,
          name: petData.name,
          type: petData.type,
          breed: petData.breed,
          sex: petData.sex,
          birthdate: petData.birthdate,
          notes: petData.notes
        };
        return { success: true, data: convertedPet };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Update pet error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lemmikin päivitys epäonnistui',
      };
    }
  },

  /**
   * Create a new pet
   */
  async createPet(petData: { name: string; type?: string; breed?: string; birthdate?: string; sex?: string; notes?: string }): Promise<{ success: boolean; pet?: Pet; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: PetResponse }>(
        '/api/pets',
        petData
      );

      if (response.data.success && response.data.data) {
        // Convert PetResponse to Pet with string ID
        const petData = response.data.data;
        const convertedPet: Pet = {
          id: String(petData.id),
          owner_id: petData.owner_id,
          name: petData.name,
          type: petData.type,
          breed: petData.breed,
          sex: petData.sex,
          birthdate: petData.birthdate,
          notes: petData.notes
        };
        return { success: true, pet: convertedPet };
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
  async deletePet(petId: string | number): Promise<{ success: boolean; message?: string }> {
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
    return {
      id: String(backendPet.id),
      owner_id: backendPet.owner_id,
      name: backendPet.name,
      type: backendPet.type,
      breed: backendPet.breed,
      sex: backendPet.sex,
      birthdate: backendPet.birthdate,
      notes: backendPet.notes
    };
  },
};

export default petService;
