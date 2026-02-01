import apiClient from './api';

interface Visit {
  id: number;
  pet_id: number;
  visit_date: string;
  location: string;
  vet_name: string;
  type_id: string;
  notes?: string;
  costs?: string;
}

interface VisitType {
  id: number;
  name: string;
}

interface CreateVisitData {
  pet_id: number;
  visit_date: string;
  vet_name: string;
  location: string;
  type_id: number;
  notes?: string;
  costs?: number;
}

interface UpdateVisitData {
  visit_date?: string;
  vet_name?: string;
  location?: string;
  type_id?: number;
  notes?: string;
  costs?: number;
}

export const visitsService = {
  // Get all visits
  getAllVisits: async (): Promise<Visit[]> => {
    const response = await apiClient.get('/api/vet-visits');
    
    if (response.data.success && response.data.data) {
      // Flatten the nested structure: each pet has a vet_visits array
      const flattenedVisits: Visit[] = [];
      response.data.data.forEach((petVisitGroup: any) => {
        const petId = petVisitGroup.pet_id;
        if (petVisitGroup.vet_visits && Array.isArray(petVisitGroup.vet_visits)) {
          petVisitGroup.vet_visits.forEach((visit: any) => {
            flattenedVisits.push({
              ...visit,
              pet_id: petId
            });
          });
        }
      });
      return flattenedVisits;
    }
    
    return [];
  },

  // Get visits for a specific pet
  getVisitsByPetId: async (petId: number): Promise<Visit[]> => {
    const allVisits = await visitsService.getAllVisits();
    return allVisits.filter(visit => visit.pet_id === petId);
  },

  // Get visit types
  getVisitTypes: async (): Promise<VisitType[]> => {
    const response = await apiClient.get('/api/vet-visits/types');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  },

  // Create a new visit
  createVisit: async (visitData: CreateVisitData): Promise<Visit | null> => {
    const response = await apiClient.post('/api/vet-visits', visitData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return null;
  },

  // Update a visit
  updateVisit: async (visitId: number, visitData: UpdateVisitData): Promise<Visit | null> => {
    const response = await apiClient.put(`/api/vet-visits/${visitId}`, visitData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    return null;
  },

  // Delete a visit
  deleteVisit: async (visitId: number): Promise<boolean> => {
    const response = await apiClient.delete(`/api/vet-visits/${visitId}`);
    return response.data.success;
  },
};
