import apiClient from './api';
import { Pet } from '../types';

export const petService = {
  // Fetch all pets for the authenticated user
  async getUserPets(): Promise<{ success: boolean; data?: Pet[]; message?: string }> {
    try {
      const response = await apiClient.get('/api/pets');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: 'Lemmikkien haku epäonnistui',
      };
    } catch (error: any) {
      console.error('Error fetching user pets:', error);
      return {
        success: false,
        message: 'Lemmikkien lataus epäonnistui',
      };
    }
  },

  // Fetch a pet by ID
  async getPetById(petId: string): Promise<{ success: boolean; data?: Pet; message?: string }> {
    try {
      const response = await apiClient.get(`/api/pets/${petId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: 'Lemmikin tietojen haku epäonnistui',
      };
    } catch (error: any) {
      console.error('Error fetching pet details:', error);
      return {
        success: false,
        message: 'Lemmikin tietojen lataus epäonnistui',
      };
    }
  },

  // Create a new pet
  async createPet(petData: Omit<Pet, 'id'>): Promise<{ success: boolean; data?: Pet; message?: string }> {
    try {
      const response = await apiClient.post('/api/pets', petData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Lemmikki lisätty onnistuneesti',
        };
      }
      
      return {
        success: false,
        message: 'Lemmikin lisääminen epäonnistui',
      };
    } catch (error: any) {
      console.error('Error creating pet:', error);
      return {
        success: false,
        message: 'Lemmikin lisääminen epäonnistui',
      };
    }
  },

  // Update an existing pet
  async updatePet(petId: string, petData: Partial<Pet>): Promise<{ success: boolean; data?: Pet; message?: string }> {
    try {
      const response = await apiClient.put(`/api/pets/${petId}`, petData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Lemmikin tiedot päivitetty onnistuneesti',
        };
      }
      
      return {
        success: false,
        message: 'Päivitys epäonnistui',
      };
    } catch (error: any) {
      console.error('Error updating pet:', error);
      return {
        success: false,
        message: 'Päivitys epäonnistui',
      };
    }
  },

  // Delete a pet
  async deletePet(petId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete(`/api/pets/${petId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Lemmikki poistettu onnistuneesti',
        };
      }
      
      return {
        success: false,
        message: 'Poistaminen epäonnistui',
      };
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      return {
        success: false,
        message: 'Poistaminen epäonnistui',
      };
    }
  },
};

export default petService;
