// Route (Walk) synchronization service
import apiClient from './api';
import { storageService } from './storageService';
import { Walk, Coordinate } from '../types';

export interface RouteCreateData {
  pet_id: number;
  started_at: string;
  ended_at: string;
  distance_m: number;
  duration_s: number;
  avg_speed_mps: number;
  coordinates: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    altitude?: number;
    accuracy?: number;
  }>;
}

export interface RouteResponse {
  id: number;
  pet_id: number;
  user_id: string;
  started_at: string;
  ended_at: string;
  distance_m: number;
  duration_s: number;
  avg_speed_mps: number;
  coordinates?: any[];
}

export const routeService = {
  /**
   * Sync a local walk to backend
   */
  async syncWalk(walk: Walk): Promise<{ success: boolean; routeId?: number; message?: string }> {
    try {
      if (!walk.path || !Array.isArray(walk.path)) {
        return { success: false, message: 'Kävelyllä ei ole reittitietoja' };
      }

      const routeData: RouteCreateData = {
        pet_id: parseInt(walk.petId),
        started_at: new Date(walk.startTime).toISOString(),
        ended_at: new Date(walk.endTime || Date.now()).toISOString(),
        distance_m: Math.round(walk.distance || 0),
        duration_s: Math.round(walk.duration || 0),
        avg_speed_mps: Math.round(((walk.averageSpeed || 0) / 3.6) * 100) / 100,
        coordinates: walk.path.map((coord: Coordinate) => ({
          latitude: coord.latitude,
          longitude: coord.longitude,
          timestamp: typeof coord.timestamp === 'number' 
            ? new Date(coord.timestamp).toISOString() 
            : coord.timestamp,
          altitude: coord.altitude,
          accuracy: coord.accuracy,
        })),
      };

      const response = await apiClient.post<{ success: boolean; message: string; data: RouteResponse }>(
        '/api/routes',
        routeData
      );

      if (response.data.success && response.data.data) {
        // Mark walk as synced
        const updatedWalk = { ...walk, synced: true, backendId: response.data.data.id.toString() };
        await storageService.updateWalk(walk.id, updatedWalk);
        
        return { success: true, routeId: response.data.data.id };
      }

      return { success: false, message: response.data.message || 'Synkronointi epäonnistui' };
    } catch (error: any) {
      console.error('Walk sync error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Synkronointi epäonnistui' 
      };
    }
  },

  /**
   * Sync all unsynced walks
   */
  async syncAllWalks(): Promise<{ synced: number; failed: number }> {
    try {
      const walks = await storageService.getWalks();
      
      if (!walks || !Array.isArray(walks)) {
        console.log('No walks to sync');
        return { synced: 0, failed: 0 };
      }
      
      const unsyncedWalks = walks.filter((walk: Walk) => !walk.synced && walk.path && Array.isArray(walk.path) && walk.path.length > 0);

      let synced = 0;
      let failed = 0;

      for (const walk of unsyncedWalks) {
        const result = await this.syncWalk(walk);
        if (result.success) {
          synced++;
        } else {
          failed++;
        }
      }

      return { synced, failed };
    } catch (error) {
      console.error('Sync all walks error:', error);
      return { synced: 0, failed: 0 };
    }
  },

  /**
   * Get all routes from backend
   */
  async getUserRoutes(): Promise<{ success: boolean; routes?: RouteResponse[]; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: RouteResponse[] }>(
        '/api/routes'
      );

      if (response.data.success) {
        return { success: true, routes: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Get routes error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Lenkkien haku epäonnistui' 
      };
    }
  },

  /**
   * Get routes for a specific pet
   */
  async getPetRoutes(petId: number): Promise<{ success: boolean; routes?: RouteResponse[]; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: RouteResponse[] }>(
        `/api/routes/pet/${petId}`
      );

      if (response.data.success) {
        return { success: true, routes: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Get pet routes error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Lenkkien haku epäonnistui' 
      };
    }
  },

  /**
   * Get a specific route with full coordinate data
   */
  async getRouteById(routeId: number): Promise<{ success: boolean; route?: RouteResponse; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: RouteResponse }>(
        `/api/routes/${routeId}`
      );

      if (response.data.success) {
        return { success: true, route: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error('Get route error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Lenkin haku epäonnistui' 
      };
    }
  },

  /**
   * Delete a route from backend
   */
  async deleteRoute(routeId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `/api/routes/${routeId}`
      );

      return { success: response.data.success, message: response.data.message };
    } catch (error: any) {
      console.error('Delete route error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Lenkin poisto epäonnistui' 
      };
    }
  },

  /**
   * Merge backend routes with local walks
   */
  async mergeRoutes(): Promise<void> {
    try {
      const result = await this.getUserRoutes();
      if (!result.success || !result.routes || !Array.isArray(result.routes)) {
        console.log('No routes to merge');
        return;
      }

      const localWalks = await storageService.getWalks();

      // Add backend routes that don't exist locally
      for (const route of result.routes) {
        const exists = localWalks.some((walk: Walk) => walk.backendId === route.id.toString());
        if (!exists) {
          const walk: Walk = {
            id: `backend_${route.id}`,
            backendId: route.id.toString(),
            petId: route.pet_id.toString(),
            petName: '', // Will need to fetch pet info separately if needed
            startTime: new Date(route.started_at).getTime(),
            endTime: new Date(route.ended_at).getTime(),
            distance: route.distance_m || 0,
            duration: route.duration_s || 0,
            averageSpeed: (route.avg_speed_mps || 0) * 3.6, // Convert m/s to km/h
            steps: 0,
            path: Array.isArray(route.coordinates) ? route.coordinates : [],
            synced: true,
          };
          await storageService.saveWalk(walk);
        }
      }
    } catch (error) {
      console.error('Merge routes error:', error);
    }
  },
};

export default routeService;
