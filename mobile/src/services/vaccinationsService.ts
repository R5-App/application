import apiClient from './api';

interface Vaccination {
  id: number;
  pet_id: number;
  vac_name: string;
  vaccination_date: string;
  expire_date?: string;
  costs?: string;
  notes?: string;
}

interface CreateVaccinationData {
  pet_id: number;
  vac_name: string;
  vaccination_date: string;
  expire_date?: string;
  notes?: string;
  costs?: number;
}

interface UpdateVaccinationData {
  vac_name?: string;
  vaccination_date?: string;
  expire_date?: string;
  notes?: string;
  costs?: number;
}

export const vaccinationsService = {
  // Get all vaccinations
  getAllVaccinations: async (): Promise<Vaccination[]> => {
    const response = await apiClient.get('/api/vaccinations');
    
    if (response.data.success && response.data.data) {
      // Flatten the nested structure: each pet has a vaccinations array
      const flattenedVaccinations: Vaccination[] = [];
      response.data.data.forEach((petVaccinationGroup: any) => {
        const petId = petVaccinationGroup.pet_id;
        if (petVaccinationGroup.vaccinations && Array.isArray(petVaccinationGroup.vaccinations)) {
          petVaccinationGroup.vaccinations.forEach((vaccination: any) => {
            flattenedVaccinations.push({
              ...vaccination,
              pet_id: petId
            });
          });
        }
      });
      return flattenedVaccinations;
    }
    
    return [];
  },

  // Get vaccinations for a specific pet
  getVaccinationsByPetId: async (petId: number): Promise<Vaccination[]> => {
    const allVaccinations = await vaccinationsService.getAllVaccinations();
    return allVaccinations.filter(vaccination => vaccination.pet_id === petId);
  },

  // Create a new vaccination
  createVaccination: async (vaccinationData: CreateVaccinationData): Promise<Vaccination | null> => {
    const response = await apiClient.post('/api/vaccinations', vaccinationData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return null;
  },

  // Update a vaccination
  updateVaccination: async (vaccinationId: number, vaccinationData: UpdateVaccinationData): Promise<Vaccination | null> => {
    const response = await apiClient.put(`/api/vaccinations/${vaccinationId}`, vaccinationData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return null;
  },

  // Delete a vaccination
  deleteVaccination: async (vaccinationId: number): Promise<boolean> => {
    const response = await apiClient.delete(`/api/vaccinations/${vaccinationId}`);
    return response.data.success;
  },
};
