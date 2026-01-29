import apiClient from "./api";

interface Medication {
    id: number;
    pet_id: number;
    med_name: string;
    medication_date: string;
    expire_date?: string;
    notes?: string;
    costs?: string;
}

interface CreateMedicationData {    
    pet_id: number;
    med_name: string;
    medication_date: string;
    expire_date?: string;
    notes?: string;
    costs?: number;
}

interface UpdateMedicationData {
    med_name?: string;
    medication_date?: string;
    expire_date?: string;
    notes?: string;
    costs?: number;
}

export const medicationsService = {
    // Get all medications
    getAllMedications: async (): Promise<Medication[]> => {
        const response = await apiClient.get('/api/medications');

        if (response.data.success && response.data.data) {
            // Flatten the nested structure: each pet has a medications array
            const flattenedMedications: Medication[] = [];
            response.data.data.forEach((petMedicationGroup: any) => {
                const petId = petMedicationGroup.pet_id;
                if (petMedicationGroup.medications && Array.isArray(petMedicationGroup.medications)) {
                    petMedicationGroup.medications.forEach((medication: any) => {
                        flattenedMedications.push({
                            ...medication,
                            pet_id: petId
                        });
                    });
                }
            });
            return flattenedMedications;
        }
    
        return [];
    },

    // get medications for a specific pet
    getMedicationsByPetId: async (petId: number): Promise<Medication[]> => {
        const allMedications = await medicationsService.getAllMedications();
        return allMedications.filter(medication => medication.pet_id === petId);
    },

    // Create a new medication
    createMedication: async (medicationData: CreateMedicationData): Promise<Medication | null> => {
        const response = await apiClient.post('/api/medications', medicationData);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return null;
    },

    // Update an existing medication
    updateMedication: async (medicationId: number, updatedData: UpdateMedicationData): Promise<Medication | null> => {
        const response = await apiClient.put(`/api/medications/${medicationId}`, updatedData);

        if (response.data.success && response.data.data) {
            return response.data.data;
        }

        return null;
    },  

    // Delete a medication
    deleteMedication: async (medicationId: number): Promise<boolean> => {
        const response = await apiClient.delete(`/api/medications/${medicationId}`);   
        return response.data.success;
    },
};