import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OSMView, useOSRMRouting, type OSMViewRef } from 'expo-osm-sdk';
import * as Location from 'expo-location';
import { useWalk } from '@contexts/WalkContext';
import { Pet } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../styles/theme';

export default function MapScreen() {
  const {
    isTracking,
    currentStats,
    currentCoordinates,
    startWalk,
    stopWalk,
    pauseWalk,
    resumeWalk,
    hasLocationPermission,
    requestLocationPermission,
  } = useWalk();

  const [isPaused, setIsPaused] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const mapRef = useRef<OSMViewRef>(null);
  const routing = useOSRMRouting();

  useEffect(() => {
    if (!hasLocationPermission) {
      requestLocationPermission();
    }
    // TODO: Hae lemmikit backendistä
    // Väliaikaisesti kovakoodatut lemmikit
    setPets([
      { id: 1, name: 'Macho', breed: 'Akita', age: 12, weight: 44, dateOfBirth: '2013-10-01' },
      { id: 2, name: 'Mirri', breed: 'Sekarotuinen', age: 2, weight: 15, dateOfBirth: '2022-06-15' },
    ]);
    
    // Hae käyttäjän sijainti heti
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userPos = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Keskitä kartta käyttäjän sijaintiin
      if (mapRef.current) {
        // Anna kartan latautua ensin
        setTimeout(() => {
          mapRef.current?.animateToLocation(
            userPos.latitude,
            userPos.longitude,
            15
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  useEffect(() => {
    if (currentCoordinates.length > 0) {
      const latest = currentCoordinates[currentCoordinates.length - 1];
      
      // Keskitä kartta käyttäjän sijaintiin
      if (mapRef.current) {
        // Anna kartan latautua ensin
        setTimeout(() => {
          mapRef.current?.animateToLocation(
            latest.latitude,
            latest.longitude,
            15
          );
        }, 500);
      }
    }
  }, [currentCoordinates]);

  const handleSelectPet = () => {
    if (pets.length === 0) {
      Alert.alert('Ei lemmikkejä', 'Lisää ensin lemmikki profiilissa');
      return;
    }
    setShowPetSelector(true);
  };

  const handleStartWalk = async (pet: Pet) => {
    try {
      // Toggle pet selection
      const isAlreadySelected = selectedPets.some(p => p.id === pet.id);
      
      if (isAlreadySelected) {
        setSelectedPets(selectedPets.filter(p => p.id !== pet.id));
      } else {
        setSelectedPets([...selectedPets, pet]);
      }
    } catch (error: any) {
      Alert.alert('Virhe', error.message || 'Lemmikin valinta epäonnistui');
    }
  };

  const handleConfirmPets = async () => {
    if (selectedPets.length === 0) {
      Alert.alert('Virhe', 'Valitse vähintään yksi lemmikki');
      return;
    }

    try {
      const petNames = selectedPets.map(p => p.name).join(', ');
      const petIds = selectedPets.map(p => p.id).join(',');
      
      setShowPetSelector(false);
      await startWalk(petIds, petNames);
    } catch (error: any) {
      Alert.alert('Virhe', error.message || 'Lenkin aloitus epäonnistui');
    }
  };

  const handleStopWalk = async () => {
    const petNames = selectedPets.map(p => p.name).join(', ');
    Alert.alert(
      'Lopeta lenkki',
      `Haluatko varmasti lopettaa lenkin${selectedPets.length > 1 ? ' lemmikeille' : ''}: ${petNames}?`,
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Lopeta',
          style: 'destructive',
          onPress: async () => {
            await stopWalk();
            setSelectedPets([]);
            Alert.alert('Lenkki tallennettu', 'Lenkki on tallennettu laitteen muistiin');
          },
        },
      ]
    );
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeWalk();
      setIsPaused(false);
    } else {
      pauseWalk();
      setIsPaused(true);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  // Luo markerit lenkin aloitus- ja lopetuspisteille
  const markers = React.useMemo(() => {
    const markerList = [];
    if (currentCoordinates.length > 0) {
      markerList.push({
        id: 'start',
        coordinate: {
          latitude: currentCoordinates[0].latitude,
          longitude: currentCoordinates[0].longitude,
        },
        title: 'Aloitus',
        description: 'Lenkin aloituspiste',
      });
    }
    return markerList;
  }, [currentCoordinates]);

  // Päivitä reitti kartalle kun koordinaatit muuttuvat
  useEffect(() => {
    if (currentCoordinates.length > 1) {
      // Piirretään reitti käyttäen OSRM routingia
      const coords = currentCoordinates.map(c => ({
        latitude: c.latitude,
        longitude: c.longitude,
      }));
      // Yksinkertaistetaan: näytetään vain markerit, koska route rendering vaatii from/to pisteet
    }
  }, [currentCoordinates]);

  return (
    <View style={styles.container}>
      {/* Kokoruutu kartta */}
      <OSMView
        ref={mapRef}
        style={styles.map}
        initialCenter={{
          latitude: 60.1699,
          longitude: 24.9384,
        }}
        initialZoom={13}
        markers={markers}
        onMarkerPress={(id) => console.log('Marker pressed:', id)}
      />

      {/* Yläosan tilastopalkki */}
      {isTracking && (
        <View style={styles.topBar}>
          {selectedPets.length > 0 && (
            <View style={styles.petInfoTop}>
              <MaterialCommunityIcons name="paw" size={20} color={COLORS.onPrimary} />
              <Text style={styles.petInfoTopText}>
                {selectedPets.map(p => p.name).join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={COLORS.onPrimary} />
              <Text style={styles.statValue}>{formatDistance(currentStats.distance)}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.onPrimary} />
              <Text style={styles.statValue}>{formatDuration(currentStats.duration)}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="speedometer" size={20} color={COLORS.onPrimary} />
              <Text style={styles.statValue}>{(currentStats.averageSpeed / 3.6).toFixed(1)} m/s</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="walk" size={20} color={COLORS.onPrimary} />
              <Text style={styles.statValue}>{currentStats.steps || 0}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Control Panel - alaosassa läpinäkyvänä */}
      {isTracking && (
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.pauseButton} 
            onPress={handlePauseResume}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={isPaused ? 'play' : 'pause'} 
              size={LAYOUT.iconLg} 
              color={COLORS.onSecondary} 
            />
            <Text style={styles.pauseButtonText}>{isPaused ? 'Jatka' : 'Tauko'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.stopButton} 
            onPress={handleStopWalk}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="stop" 
              size={LAYOUT.iconLg} 
              color={COLORS.onError} 
            />
            <Text style={styles.stopButtonText}>Lopeta</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isTracking && (
        <View style={styles.controlPanel}>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleSelectPet}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="paw" 
              size={LAYOUT.iconXl} 
              color={COLORS.onPrimary} 
            />
            <Text style={styles.startButtonText}>Aloita lenkki</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pet Selection Modal */}
      <Modal
        visible={showPetSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Valitse lemmikki(t)</Text>
            <Text style={styles.modalSubtitle}>Voit valita useamman lemmikin kerralla</Text>
            <ScrollView style={styles.petList}>
              {pets.map((pet) => {
                const isSelected = selectedPets.some(p => p.id === pet.id);
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.petItem, isSelected && styles.petItemSelected]}
                    onPress={() => handleStartWalk(pet)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                      size={32} 
                      color={isSelected ? COLORS.primary : COLORS.onSurfaceVariant} 
                    />
                    <View style={styles.petItemInfo}>
                      <Text style={[styles.petItemName, isSelected && styles.petItemNameSelected]}>{pet.name}</Text>
                      <Text style={styles.petItemBreed}>{pet.breed}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmPets}
              >
                <Text style={styles.modalConfirmText}>
                  Aloita lenkki{selectedPets.length > 0 ? ` (${selectedPets.length})` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowPetSelector(false);
                  setSelectedPets([]);
                }}
              >
                <Text style={styles.modalCloseText}>Peruuta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  statsPanel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: LAYOUT.radiusLg,
    borderTopRightRadius: LAYOUT.radiusLg,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    maxHeight: 250,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: LAYOUT.radiusMd,
    padding: SPACING.md,
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? SPACING.xl + 30 : SPACING.xl + 20,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: LAYOUT.radiusLg,
    borderBottomRightRadius: LAYOUT.radiusLg,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  petInfoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  petInfoTopText: {
    ...TYPOGRAPHY.titleMedium,
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.onPrimary,
    opacity: 0.3,
  },
  controlPanel: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    paddingBottom: SPACING.xl + 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: LAYOUT.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.onPrimary,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 90,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  pauseButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: LAYOUT.radiusLg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    flex: 1,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pauseButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.onSecondary,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: COLORS.error,
    borderRadius: LAYOUT.radiusLg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    flex: 1,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  stopButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.onError,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    padding: SPACING.sm,
    borderRadius: LAYOUT.radiusMd,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  petInfoText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.onPrimaryContainer,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: LAYOUT.radiusLg,
    borderTopRightRadius: LAYOUT.radiusLg,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    ...TYPOGRAPHY.headlineSmall,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  petList: {
    marginBottom: SPACING.md,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: LAYOUT.radiusMd,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  petItemSelected: {
    backgroundColor: COLORS.primaryContainer,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  petItemInfo: {
    flex: 1,
  },
  petItemName: {
    ...TYPOGRAPHY.titleMedium,
    color: COLORS.onSurface,
  },
  petItemNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  petItemBreed: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
  },
  modalActions: {
    gap: SPACING.sm,
  },
  modalConfirmButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: LAYOUT.radiusMd,
    alignItems: 'center',
  },
  modalConfirmText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: LAYOUT.radiusMd,
    alignItems: 'center',
  },
  modalCloseText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.onSurfaceVariant,
  },
});
