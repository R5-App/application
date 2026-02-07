import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Walk } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../styles/theme';

export default function WalkDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { walk } = route.params as { walk: Walk };
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (walk.path?.length > 0 && mapRef.current) {
      // Keskitä kartta lenkin reitille
      const coords = walk.path.map((c: any) => ({
        latitude: c.latitude,
        longitude: c.longitude,
      }));
      
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 150, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [walk]);

  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0 min';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const formatDistance = (meters: number): string => {
    if (!meters || isNaN(meters)) return '0 m';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fi-FI');
  };

  return (
    <View style={styles.container}>
      {/* Kokoruutu kartta */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        mapType="standard"
        initialRegion={{
          latitude: walk.path?.[0]?.latitude || 60.1699,
          longitude: walk.path?.[0]?.longitude || 24.9384,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Lenkin reitti */}
        {walk.path?.length > 1 && (
          <Polyline
            coordinates={walk.path.map((c: any) => ({
              latitude: c.latitude,
              longitude: c.longitude,
            }))}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}
        
        {/* Aloituspiste */}
        {walk.path?.length > 0 && (
          <Marker
            coordinate={{
              latitude: walk.path[0].latitude,
              longitude: walk.path[0].longitude,
            }}
            title="Aloitus"
            pinColor="green"
          />
        )}

        {/* Lopetuspiste */}
        {walk.path?.length > 0 && (
          <Marker
            coordinate={{
              latitude: walk.path[walk.path.length - 1].latitude,
              longitude: walk.path[walk.path.length - 1].longitude,
            }}
            title="Lopetus"
            pinColor="red"
          />
        )}
      </MapView>

      {/* Näytä viesti jos ei reittidataa */}
      {(!walk.path || walk.path.length === 0) && (
        <View style={styles.noDataOverlay}>
          <MaterialCommunityIcons name="map-marker-off" size={64} color={COLORS.onSurfaceVariant} />
          <Text style={styles.noDataText}>Ei reittidataa saatavilla</Text>
          <Text style={styles.noDataSubtext}>Tämä lenkki tallennettiin ilman sijaintitietoja</Text>
        </View>
      )}

      {/* Yläosan tilastopalkki */}
      <View style={styles.topBar}>
        <View style={styles.topBarHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.onPrimary} />
          </TouchableOpacity>
          <View style={styles.topBarTitleContainer}>
            <MaterialCommunityIcons name="paw" size={20} color={COLORS.onPrimary} />
            <Text style={styles.topBarTitle}>{walk.petName}</Text>
          </View>
        </View>

        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={20} color={COLORS.onPrimary} />
            <Text style={styles.statValue}>{formatDistance(walk.distance)}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.onPrimary} />
            <Text style={styles.statValue}>{formatDuration(walk.duration)}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="speedometer" size={20} color={COLORS.onPrimary} />
            <Text style={styles.statValue}>
              {typeof walk.averageSpeed === 'number' ? walk.averageSpeed.toFixed(1) : '0.0'} km/h
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="walk" size={20} color={COLORS.onPrimary} />
            <Text style={styles.statValue}>{walk.steps || 0}</Text>
          </View>
        </View>

        <Text style={styles.dateText}>{formatDate(walk.startTime)}</Text>
      </View>
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl + 20,
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
  topBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  topBarTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  topBarTitle: {
    ...TYPOGRAPHY.titleLarge,
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.sm,
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
  dateText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onPrimary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.9,
  },
  noDataOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  noDataText: {
    ...TYPOGRAPHY.titleMedium,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  noDataSubtext: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.7,
  },
});
