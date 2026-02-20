// Avatar service for handling user and pet avatars
import apiClient from './api';

export interface Avatar {
  id: number;
  user_id: string;
  pet_id: number | null;
  filename: string;
  created_at: string;
}

export const avatarService = {
  /**
   * Upload avatar for a pet or user
   * @param file - File object from image picker
   * @param petId - Optional pet ID (if uploading for a pet)
   */
  async uploadAvatar(file: any, petId?: number): Promise<{ success: boolean; data?: Avatar; message?: string }> {
    try {
      const formData = new FormData();
      
      // Append file to form data
      // Note: Expo ImagePicker returns: uri, width, height, type, fileName, fileSize, mimeType
      formData.append('avatar', {
        uri: file.uri,
        type: file.mimeType || file.type || 'image/jpeg',
        name: file.fileName || file.name || `avatar-${Date.now()}.jpg`,
      } as any);

      // Append pet_id if provided
      if (petId) {
        formData.append('pet_id', petId.toString());
      }

      const response = await apiClient.post<{ success: boolean; message: string; data: Avatar }>(
        '/api/avatars',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Avatar upload failed';
      console.error('Upload avatar error:', errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  /**
   * Get avatar by ID
   */
  async getAvatarById(id: number): Promise<{ success: boolean; data?: Avatar; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: Avatar }>(
        `/api/avatars/${id}`
      );

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get avatar';
      console.error('Get avatar error:', errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  /**
   * Get avatar for a specific pet
   */
  async getAvatarByPetId(petId: number): Promise<{ success: boolean; data?: Avatar; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: Avatar }>(
        `/api/avatars/pet/${petId}`
      );

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get pet avatar';
      console.error('Get pet avatar error:', errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  /**
   * Get current avatar for authenticated user
   */
  async getUserAvatar(): Promise<{ success: boolean; data?: Avatar; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: Avatar }>(
        '/api/avatars/user/current'
      );

      if (response.data.success) {
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get user avatar';
      console.error('Get user avatar error:', errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  /**
   * Download/Get avatar file URL for display
   * Embeds auth token in URL so React Native Image component can authenticate
   */
  getAvatarImageUrl(avatarId: number): string {
    try {
      // Get token from axios default headers (set by authService)
      const authHeader = apiClient.defaults.headers.common['Authorization'] as string;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        // Pass token as query parameter so Image component can authenticate
        return `${apiClient.defaults.baseURL}/api/avatars/${avatarId}/download?token=${token}`;
      }
    } catch (error) {
      console.warn('Could not get auth token for image URL');
    }
    
    // Fallback without token (might fail if download route requires auth)
    return `${apiClient.defaults.baseURL}/api/avatars/${avatarId}/download`;
  },

  /**
   * Delete avatar by ID
   */
  async deleteAvatar(avatarId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `/api/avatars/${avatarId}`
      );

      if (response.data.success) {
        return { success: true, message: response.data.message };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete avatar';
      console.error('Delete avatar error:', errorMessage);
      return { success: false, message: errorMessage };
    }
  },
};

export default avatarService;
