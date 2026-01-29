import apiClient from './api';

interface WeightRecord {
  id: number;
  petId: number;
  date: string;
  weight: number;
  created_at: string;
  notes?: string;
  measuredBy?: string;
}

interface CreateWeightData {
  pet_id: number;
  weight: number;
  date: string;
  notes?: string;
  measuredBy?: string;
}

interface UpdateWeightData {
  weight?: number;
  date?: string;
  notes?: string;
  measuredBy?: string;
}

export const weightsService = {
  // Get all weight records
  getAllWeights: async (): Promise<WeightRecord[]> => {
    const response = await apiClient.get('/api/weights');
    
    if (response.data.success && response.data.data) {
      const weightsData = response.data.data;
      
      // If nested structure (array of pet weight groups)
      if (Array.isArray(weightsData) && weightsData.length > 0 && weightsData[0].weights) {
        const flattenedWeights: WeightRecord[] = [];
        weightsData.forEach((petWeightGroup: any) => {
          const petId = petWeightGroup.pet_id;
          if (petWeightGroup.weights && Array.isArray(petWeightGroup.weights)) {
            petWeightGroup.weights.forEach((weight: any) => {
              flattenedWeights.push({
                ...weight,
                petId: petId,
                weight: parseFloat(weight.weight) // Convert string to number
              });
            });
          }
        });
        return flattenedWeights;
      } else {
        // If flat structure
        return weightsData;
      }
    }
    
    return [];
  },

  // Get weight records for a specific pet
  getWeightsByPetId: async (petId: number): Promise<WeightRecord[]> => {
    const allWeights = await weightsService.getAllWeights();
    return allWeights.filter(weight => weight.petId === petId);
  },

  // Create a new weight record
  createWeight: async (weightData: CreateWeightData): Promise<WeightRecord | null> => {
    const response = await apiClient.post('/api/weights', weightData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return null;
  },

  // Update a weight record
  updateWeight: async (weightId: number, weightData: UpdateWeightData): Promise<WeightRecord | null> => {
    const response = await apiClient.put(`/api/weights/${weightId}`, weightData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return null;
  },

  // Delete a weight record
  deleteWeight: async (weightId: number): Promise<boolean> => {
    const response = await apiClient.delete(`/api/weights/${weightId}`);
    return response.data.success;
  },
};
