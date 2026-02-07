import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Platform, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useWalk } from '@contexts/WalkContext';
import { petService } from '@services/petService';
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
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  // Fetch pets from backend
  const fetchPets = useCallback(async () => {
    try {
      const result = await petService.getUserPets();
      if (result.success && result.pets) {
        const appPets = result.pets.map(petService.convertToAppPet);
        setPets(appPets);
      }
    } catch (error) {
      console.error('Failed to fetch pets:', error);
    }
  }, []);

  useEffect(() => {
    if (!hasLocationPermission) {
      requestLocationPermission();
    }
    fetchPets();
    // Hae sijainti heti kun komponentti mounttaa
    getCurrentLocation();
  }, [fetchPets]);

  // Animoidaan kartta käyttäjän sijaintiin kun sijainti saadaan ja kartta on valmis
  useEffect(() => {
    if (userLocation && mapReady && mapRef.current) {
      setTimeout(() => {
        try {
          mapRef.current?.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        } catch (error) {
          console.error('Map animation error:', error);
        }
      }, 300);
    }
  }, [userLocation, mapReady]);

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

      // Päivitä käyttäjän sijainti (useEffect hoitaa animoinnin)
      setUserLocation(userPos);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  useEffect(() => {
    if (currentCoordinates.length > 0 && mapReady) {
      const latest = currentCoordinates[currentCoordinates.length - 1];
      
      // Päivitä käyttäjän sijainti myös userLocation tilaan (markerin liikuttamiseksi)
      setUserLocation({
        latitude: latest.latitude,
        longitude: latest.longitude,
      });
      
      // Keskitä kartta käyttäjän sijaintiin - Android 15 turvallisuus
      if (mapRef.current && latest.latitude && latest.longitude) {
        try {
          mapRef.current.animateToRegion({
            latitude: latest.latitude,
            longitude: latest.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        } catch (error) {
          console.error('Map animation error:', error);
        }
      }
    }
  }, [currentCoordinates, mapReady]);

  const handleSelectPet = async () => {
    // Check location permission first
    if (!hasLocationPermission) {
      Alert.alert(
        'Sijaintitiedot tarvitaan',
        'Anna sovellukselle lupa käyttää sijaintitietoja lenkin seuraamiseksi.',
        [
          { text: 'Peruuta', style: 'cancel' },
          {
            text: 'Avaa asetukset',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return;
    }

    if (pets.length === 0) {
      Alert.alert('Ei lemmikkeitä', 'Lisää ensin lemmikki profiilissa');
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
    if (!seconds || isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (!meters || isNaN(meters)) return '0 m';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  return (
    <View style={styles.container}>
      {/* Kokoruutu kartta */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        mapType="standard"
        initialRegion={{
          latitude: userLocation?.latitude || 60.1699,
          longitude: userLocation?.longitude || 24.9384,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        followsUserLocation={false}
        loadingEnabled={true}
        loadingIndicatorColor={COLORS.primary}
        loadingBackgroundColor={COLORS.background}
        scrollEnabled={hasLocationPermission}
        zoomEnabled={hasLocationPermission}
        pitchEnabled={hasLocationPermission}
        rotateEnabled={hasLocationPermission}
        onMapReady={() => {
          setMapReady(true);
          // Päivitä sijainti kun kartta on valmis
          if (!userLocation) {
            getCurrentLocation();
          }
        }}
      >
        {/* Tassunjäljet reitillä */}
        {currentCoordinates.length > 1 && currentCoordinates
          .filter((_, index) => index > 0 && index < currentCoordinates.length - 1 && index % 8 === 0)
          .map((coord, index) => (
            <Marker
              key={`paw-${index}`}
              coordinate={{
                latitude: coord.latitude,
                longitude: coord.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat={true}
            >
              <MaterialCommunityIcons name="paw" size={20} color={COLORS.primary} style={{ opacity: 0.6 }} />
            </Marker>
          ))
        }
        
        {/* Aloituspiste - näkyy vain kun ei trackkausta käynnissä */}
        {!isTracking && currentCoordinates.length > 0 && (
          <Marker
            coordinate={{
              latitude: currentCoordinates[0].latitude,
              longitude: currentCoordinates[0].longitude,
            }}
            title="Aloitus"
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
          >
            <MaterialCommunityIcons name="flag-checkered" size={28} color={COLORS.success} />
          </Marker>
        )}
        
        {/* Nykyinen sijainti lenkin aikana - lemmikin ikoni (kissa/koira) */}
        {isTracking && selectedPets.length > 0 && (
          <Marker
            coordinate={{
              latitude: currentCoordinates.length > 0 
                ? currentCoordinates[currentCoordinates.length - 1].latitude 
                : userLocation?.latitude || 60.1699,
              longitude: currentCoordinates.length > 0 
                ? currentCoordinates[currentCoordinates.length - 1].longitude 
                : userLocation?.longitude || 24.9384,
            }}
            title={selectedPets.map(p => p.name).join(', ')}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            tracksViewChanges={false}
          >
            <MaterialCommunityIcons 
              name={selectedPets[0].type?.toLowerCase() === 'cat' ? 'cat' : 'dog'} 
              size={48} 
              color="#424242" 
            />
          </Marker>
        )}
        
        {/* Käyttäjän sijainti kun ei lenkkiä käynnissä */}
        {!isTracking && userLocation && (
          <Marker
            coordinate={userLocation}
            title="Sijaintisi"
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
          >
            <MaterialCommunityIcons name="circle" size={16} color={COLORS.primary} />
          </Marker>
        )}
      </MapView>

      {/* Overlay kun ei sijaintilupaa */}
      {!hasLocationPermission && (
        <View style={styles.mapOverlay}>
          <View style={styles.overlayContent}>
            <MaterialCommunityIcons name="map-marker-off" size={64} color={COLORS.onSurfaceVariant} />
            <Text style={styles.overlayTitle}>Sijaintitiedot tarvitaan</Text>
            <Text style={styles.overlayText}>
              Anna sovellukselle lupa käyttää sijaintitietoja nähdäksesi kartan ja aloittaaksesi lenkin seuraamisen.
            </Text>
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={async () => {
                const granted = await requestLocationPermission();
                if (granted) {
                  getCurrentLocation();
                } else {
                  Alert.alert(
                    'Sijaintilupa evätty',
                    'Voit myöhemmin sallia sijaintitiedot laitteen asetuksista.',
                    [
                      { text: 'OK', style: 'cancel' },
                      {
                        text: 'Avaa asetukset',
                        onPress: () => {
                          if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                          } else {
                            Linking.openSettings();
                          }
                        },
                      },
                    ]
                  );
                }
              }}
            >
              <Text style={styles.overlayButtonText}>Salli sijaintitiedot</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            style={[
              styles.startButton,
              !hasLocationPermission && styles.startButtonDisabled
            ]} 
            onPress={handleSelectPet}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="paw" 
              size={LAYOUT.iconXl} 
              color={hasLocationPermission ? COLORS.onPrimary : COLORS.onSurfaceVariant} 
            />
            <Text style={[
              styles.startButtonText,
              !hasLocationPermission && styles.startButtonTextDisabled
            ]}>
              {hasLocationPermission ? 'Aloita lenkki' : 'Sijaintilupa tarvitaan'}
            </Text>
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
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  overlayContent: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radiusLg,
    padding: SPACING.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overlayTitle: {
    ...TYPOGRAPHY.titleLarge,
    color: COLORS.onSurface,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  overlayText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  overlayButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.radiusMd,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  overlayButtonText: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  markerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xs,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  startButtonDisabled: {
    backgroundColor: COLORS.surfaceVariant,
    opacity: 0.6,
  },
  startButtonTextDisabled: {
    color: COLORS.onSurfaceVariant,
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
    backgroundColor: COLORS.backdrop,
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
