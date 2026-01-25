import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { Walk, Coordinate, WalkStats, WalkSettings } from '../types';
import { storageService } from '../services/storageService';
import { locationService } from '../services/locationService';

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
    calories: 0,
  });
  const [walks, setWalks] = useState<Walk[]>([]);
  const [settings, setSettings] = useState<WalkSettings>({
    enableSync: false,
    autoStartOnMovement: false,
    trackSteps: true,
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
      calories: 0,
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
          const calories = steps * 0.04; // Approximate calories
          setCurrentStats((prev: WalkStats) => ({
            ...prev,
            steps,
            calories: Math.round(calories),
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

    // Create walk object
    const walk: Walk = {
      id: `walk_${endTime}`,
      startTime,
      endTime,
      coordinates: currentCoordinates,
      stats: currentStats,
      petId: currentPetId,
      petName: currentPetName,
      synced: false,
    };

    // Save to storage
    await storageService.saveWalk(walk);
    
    // Update state
    setWalks(prev => [...prev, walk]);
    setIsTracking(false);
    setIsPaused(false);
    setCurrentWalk(walk);
  };

  const pauseWalk = () => {
    setIsPaused(true);
  };

  const resumeWalk = () => {
    setIsPaused(false);
  };

  const deleteWalk = async (id: string) => {
    await storageService.deleteWalk(id);
    setWalks(prev => prev.filter(walk => walk.id !== id));
  };

  const refreshWalks = async () => {
    await loadWalks();
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
