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
  role?: 'omistaja' | 'hoitaja' | 'lääkäri'; // User's role for this pet
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
      const errorMessage = error.response?.data?.message || 'Lemmikkien haku epäonnistui';
      if (__DEV__) {
        console.log('Get user pets failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
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
          notes: petData.notes,
          role: petData.role || 'omistaja'
        };
        return { success: true, data: convertedPet };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lemmikin haku epäonnistui';
      if (__DEV__) {
        console.log('Get pet by ID failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
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
      const errorMessage = error.response?.data?.message || 'Lemmikin tietojen haku epäonnistui';
      if (__DEV__) {
        console.log('Get complete pet data failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
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
          notes: petData.notes,
          role: petData.role || 'omistaja'
        };
        return { success: true, data: convertedPet };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lemmikin päivitys epäonnistui';
      if (__DEV__) {
        console.log('Update pet failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
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
          notes: petData.notes,
          role: petData.role || 'omistaja'
        };
        return { success: true, pet: convertedPet };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lemmikin luonti epäonnistui';
      if (__DEV__) {
        console.log('Create pet failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
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
      const errorMessage = error.response?.data?.message || 'Lemmikin poisto epäonnistui';
      if (__DEV__) {
        console.log('Delete pet failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
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

  /**
   * Share pet - Generate share code
   */
  async sharePet(petId: string | number, expiresIn: string = '24h'): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.post(
        `/api/pets/${petId}/share`,
        { expiresIn }
      );

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Jakokoodin luonti epäonnistui';
      if (__DEV__) {
        console.log('Share pet failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Redeem share code
   */
  async redeemShareCode(shareCode: string): Promise<{ success: boolean; data?: Pet; message?: string }> {
    try {
      const response = await apiClient.post(
        '/api/pets/redeem',
        { shareCode }
      );

      if (response.data.success && response.data.data) {
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
      // Log only the error message, not the full Axios error object
      const errorMessage = error.response?.data?.message || 'Jakokoodin lunastus epäonnistui';
      if (__DEV__) {
        console.log('Redeem share code failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Get shared users for a pet
   */
  async getSharedUsers(petId: string | number): Promise<{ success: boolean; data?: any[]; count?: number; message?: string }> {
    try {
      const response = await apiClient.get(
        `/api/pets/${petId}/shared-users`
      );

      if (response.data.success) {
        return { 
          success: true, 
          data: response.data.data,
          count: response.data.count 
        };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Jaettujen käyttäjien haku epäonnistui';
      if (__DEV__) {
        console.log('Get shared users failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Remove shared user access
   */
  async removeSharedUser(petId: string | number, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete(
        `/api/pets/${petId}/shared-users/${userId}`
      );

      if (response.data.success) {
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Käyttäjän poisto epäonnistui';
      if (__DEV__) {
        console.log('Remove shared user failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  /**
   * Update shared user role
   */
  async updateSharedUserRole(petId: string | number, userId: string, role: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.put(
        `/api/pets/${petId}/shared-users/${userId}`,
        { role }
      );

      if (response.data.success) {
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Roolin päivitys epäonnistui';
      if (__DEV__) {
        console.log('Update shared user role failed:', errorMessage);
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
};

export default petService;
