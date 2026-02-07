import AsyncStorage from '@react-native-async-storage/async-storage';
import { Walk, WalkSettings } from '../types';

const WALKS_KEY = '@walks';
const WALK_SETTINGS_KEY = '@walk_settings';

export const storageService = {
  // Walk operations
  async saveWalk(walk: Walk): Promise<void> {
    try {
      const walks = await this.getWalks();
      walks.push(walk);
      await AsyncStorage.setItem(WALKS_KEY, JSON.stringify(walks));
    } catch (error) {
      console.error('Error saving walk:', error);
      throw error;
    }
  },

  async getWalks(): Promise<Walk[]> {
    try {
      const walksJson = await AsyncStorage.getItem(WALKS_KEY);
      return walksJson ? JSON.parse(walksJson) : [];
    } catch (error) {
      console.error('Error getting walks:', error);
      return [];
    }
  },

  async getWalkById(id: string): Promise<Walk | null> {
    try {
      const walks = await this.getWalks();
      return walks.find(walk => walk.id === id) || null;
    } catch (error) {
      console.error('Error getting walk by id:', error);
      return null;
    }
  },

  async updateWalk(id: string, updatedWalk: Walk): Promise<void> {
    try {
      const walks = await this.getWalks();
      const index = walks.findIndex(walk => walk.id === id);
      if (index !== -1) {
        walks[index] = updatedWalk;
        await AsyncStorage.setItem(WALKS_KEY, JSON.stringify(walks));
      }
    } catch (error) {
      console.error('Error updating walk:', error);
      throw error;
    }
  },

  async deleteWalk(id: string): Promise<void> {
    try {
      const walks = await this.getWalks();
      const filteredWalks = walks.filter(walk => walk.id !== id);
      await AsyncStorage.setItem(WALKS_KEY, JSON.stringify(filteredWalks));
    } catch (error) {
      console.error('Error deleting walk:', error);
      throw error;
    }
  },

  async getUnsyncedWalks(): Promise<Walk[]> {
    try {
      const walks = await this.getWalks();
      return walks.filter(walk => !walk.synced);
    } catch (error) {
      console.error('Error getting unsynced walks:', error);
      return [];
    }
  },

  // Settings operations
  async getWalkSettings(): Promise<WalkSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(WALK_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {
        enableSync: false,
        autoStartOnMovement: false,
        trackSteps: true,
        syncOnlyOnWifi: false,
        syncedOnce: false,
      };
    } catch (error) {
      console.error('Error getting walk settings:', error);
      return {
        enableSync: false,
        autoStartOnMovement: false,
        trackSteps: true,
        syncOnlyOnWifi: false,
        syncedOnce: false,
      };
    }
  },

  async saveWalkSettings(settings: WalkSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(WALK_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving walk settings:', error);
      throw error;
    }
  },

  async clearAllWalks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WALKS_KEY);
    } catch (error) {
      console.error('Error clearing walks:', error);
      throw error;
    }
  },
};
