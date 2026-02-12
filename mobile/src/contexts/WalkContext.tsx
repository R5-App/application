import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { Walk, Coordinate, WalkStats, WalkSettings } from '../types';
import { storageService } from '../services/storageService';
import { locationService } from '../services/locationService';
import { routeService } from '../services/routeService';

interface WalkContextType {
  // Current walk state
  isTracking: boolean;
  currentWalk: Walk | null;
  currentCoordinates: Coordinate[];
  currentStats: WalkStats;
  
  // Walk history
  walks: Walk[];
  
  // Settings
  settings: WalkSettings;
  updateSettings: (settings: WalkSettings) => Promise<void>;
  
  // Actions
  startWalk: (petId: string, petName: string) => Promise<void>;
  stopWalk: () => Promise<void>;
  pauseWalk: () => void;
  resumeWalk: () => void;
  deleteWalk: (id: string) => Promise<void>;
  refreshWalks: () => Promise<void>;
  
  // Sync
  syncWalk: (walk: Walk) => Promise<{ success: boolean; message?: string }>;
  syncAllWalks: () => Promise<{ synced: number; failed: number }>;
  
  // Permission
  hasLocationPermission: boolean;
  requestLocationPermission: () => Promise<boolean>;
}

const WalkContext = createContext<WalkContextType | undefined>(undefined);

export function WalkProvider({ children }: { children: ReactNode }) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWalk, setCurrentWalk] = useState<Walk | null>(null);
  const [currentCoordinates, setCurrentCoordinates] = useState<Coordinate[]>([]);
  const [currentStats, setCurrentStats] = useState<WalkStats>({
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    steps: 0,
  });
  const [walks, setWalks] = useState<Walk[]>([]);
  const [settings, setSettings] = useState<WalkSettings>({
    enableSync: false,
    autoStartOnMovement: false,
    trackSteps: true,
    syncOnlyOnWifi: false,
    syncedOnce: false,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [currentPetId, setCurrentPetId] = useState<string>('');
  const [currentPetName, setCurrentPetName] = useState<string>('');
  
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [pedometerSubscription, setPedometerSubscription] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Load walks and settings on mount
  useEffect(() => {
    loadWalks();
    loadSettings();
    checkLocationPermission();
  }, []);

  // Update duration while tracking
  useEffect(() => {
    if (!isTracking || isPaused) return;

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setCurrentStats((prev: WalkStats) => ({ ...prev, duration }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, isPaused, startTime]);

  const checkLocationPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setHasLocationPermission(status === 'granted');
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const granted = await locationService.requestPermissions();
    setHasLocationPermission(granted);
    return granted;
  };

  const loadWalks = async () => {
    const loadedWalks = await storageService.getWalks();
    setWalks(loadedWalks);
  };

  const loadSettings = async () => {
    const loadedSettings = await storageService.getWalkSettings();
    setSettings(loadedSettings);
  };

  const updateSettings = async (newSettings: WalkSettings) => {
    await storageService.saveWalkSettings(newSettings);
    setSettings(newSettings);
  };

  const startWalk = async (petId: string, petName: string) => {
    if (!hasLocationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Location permission required');
      }
    }

    const now = Date.now();
    setStartTime(now);
    setIsTracking(true);
    setIsPaused(false);
    setCurrentPetId(petId);
    setCurrentPetName(petName);
    setCurrentCoordinates([]);
    setCurrentStats({
      distance: 0,
      duration: 0,
      averageSpeed: 0,
      steps: 0,
    });

    // Start location tracking
    const subscription = await locationService.startLocationTracking(
      (coordinate) => {
        if (!isPaused) {
          setCurrentCoordinates(prev => {
            const newCoords = [...prev, coordinate];
            
            // Calculate distance
            const distance = locationService.calculateTotalDistance(newCoords);
            const duration = Math.floor((Date.now() - startTime) / 1000);
            const averageSpeed = duration > 0 ? (distance / 1000) / (duration / 3600) : 0;
            
            setCurrentStats((prevStats: WalkStats) => ({
              ...prevStats,
              distance,
              averageSpeed,
            }));
            
            return newCoords;
          });
        }
      }
    );
    setLocationSubscription(subscription);

    // Start step tracking if enabled
    if (settings.trackSteps) {
      const isPedometerAvailable = await Pedometer.isAvailableAsync();
      if (isPedometerAvailable) {
        const subscription = Pedometer.watchStepCount(result => {
          const steps = result.steps;
          setCurrentStats((prev: WalkStats) => ({
            ...prev,
            steps,
          }));
        });
        setPedometerSubscription(subscription);
      }
    }
  };

  const stopWalk = async () => {
    const endTime = Date.now();
    
    // Stop tracking
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    
    if (pedometerSubscription) {
      pedometerSubscription.remove();
      setPedometerSubscription(null);
    }

    // Calculate final duration and stats
    const finalDuration = Math.floor((endTime - startTime) / 1000);
    const finalDistance = Math.round(currentStats.distance || 0);
    const finalAverageSpeed = finalDuration > 0 
      ? Math.round(((finalDistance / 1000) / (finalDuration / 3600)) * 100) / 100 
      : 0;

    // Create walk object
    const walk: Walk = {
      id: `walk_${endTime}`,
      petId: currentPetId,
      petName: currentPetName,
      startTime,
      endTime,
      distance: finalDistance,
      duration: finalDuration,
      averageSpeed: finalAverageSpeed,
      steps: Math.round(currentStats.steps || 0),
      path: currentCoordinates || [],
      synced: false,
    };

    // Save to storage
    await storageService.saveWalk(walk);
    
    // Update state
    setWalks(prev => [...prev, walk]);
    setIsTracking(false);
    setIsPaused(false);
    setCurrentWalk(walk);

    // Auto-sync if enabled and path has coordinates
    if (settings.enableSync && walk.path.length > 0) {
      try {
        await routeService.syncWalk(walk);
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  };

  const pauseWalk = () => {
    setIsPaused(true);
  };

  const resumeWalk = () => {
    setIsPaused(false);
  };

  const deleteWalk = async (id: string) => {
    const walk = walks.find(w => w.id === id);
    
    // Delete from backend if it has been synced
    if (walk?.backendId && settings.enableSync) {
      try {
        await routeService.deleteRoute(parseInt(walk.backendId));
      } catch (error) {
        console.error('Failed to delete walk from backend:', error);
        // Don't throw error, continue with local deletion
      }
    }
    
    // Delete from local storage
    await storageService.deleteWalk(id);
    setWalks(prev => prev.filter(walk => walk.id !== id));
  };

  const refreshWalks = async () => {
    await loadWalks();
    
    // Merge with backend routes if sync is enabled
    if (settings.enableSync) {
      try {
        await routeService.mergeRoutes();
        await loadWalks(); // Reload after merge
      } catch (error) {
        console.error('Failed to merge routes:', error);
        // Don't throw, just log the error
      }
    }
  };

  const syncWalk = async (walk: Walk) => {
    try {
      if (!walk.path || !Array.isArray(walk.path) || walk.path.length === 0) {
        return { success: false, message: 'Kävelyllä ei ole reittitietoja' };
      }
      
      const result = await routeService.syncWalk(walk);
      if (result.success) {
        await loadWalks(); // Reload to get updated sync status
      }
      return result;
    } catch (error: any) {
      console.error('Sync walk error:', error);
      return { success: false, message: error.message || 'Synkronointi epäonnistui' };
    }
  };

  const syncAllWalks = async () => {
    try {
      const result = await routeService.syncAllWalks();
      await loadWalks(); // Reload to get updated sync status
      return result;
    } catch (error) {
      console.error('Sync all walks error:', error);
      return { synced: 0, failed: 0 };
    }
  };

  return (
    <WalkContext.Provider
      value={{
        isTracking,
        currentWalk,
        currentCoordinates,
        currentStats,
        walks,
        settings,
        updateSettings,
        startWalk,
        stopWalk,
        pauseWalk,
        resumeWalk,
        deleteWalk,
        refreshWalks,
        syncWalk,
        syncAllWalks,
        hasLocationPermission,
        requestLocationPermission,
      }}
    >
      {children}
    </WalkContext.Provider>
  );
}

export function useWalk() {
  const context = useContext(WalkContext);
  if (context === undefined) {
    throw new Error('useWalk must be used within a WalkProvider');
  }
  return context;
}
