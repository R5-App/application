import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { OSMView, useOSRMRouting, type OSMViewRef } from 'expo-osm-sdk';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Walk } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../styles/theme';

export default function WalkDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { walk } = route.params as { walk: Walk };
  const mapRef = useRef<OSMViewRef>(null);
  const routing = useOSRMRouting();

  useEffect(() => {
    if (walk.coordinates.length > 0 && mapRef.current) {
      // Keskitä kartta lenkin ensimmäiseen pisteeseen
      const firstCoord = walk.coordinates[0];
      // Anna kartan latautua ensin
      setTimeout(() => {
        mapRef.current?.animateToLocation(
          firstCoord.latitude,
          firstCoord.longitude,
          13
        );
      }, 1000);
    }
  }, [walk]);

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Luo markerit lenkin aloitus- ja lopetuspisteille
  const markers = React.useMemo(() => {
    const markerList = [];
    if (walk.coordinates.length > 0) {
      markerList.push({
        id: 'start',
        coordinate: {
          latitude: walk.coordinates[0].latitude,
          longitude: walk.coordinates[0].longitude,
        },
        title: 'Aloitus',
        description: 'Lenkin aloituspiste',
      });
      
      if (walk.coordinates.length > 1) {
        const lastCoord = walk.coordinates[walk.coordinates.length - 1];
        markerList.push({
          id: 'end',
          coordinate: {
            latitude: lastCoord.latitude,
            longitude: lastCoord.longitude,
          },
          title: 'Lopetus',
          description: 'Lenkin lopetuspiste',
        });
      }
    }
    return markerList;
  }, [walk.coordinates]);

  return (
    <View style={styles.container}>
      {/* Kokoruutu kartta */}
      <OSMView
        ref={mapRef}
        style={styles.map}
        initialCenter={{
          latitude: walk.coordinates[0]?.latitude || 60.1699,
          longitude: walk.coordinates[0]?.longitude || 24.9384,
        }}
        initialZoom={13}
        markers={markers}
        onMarkerPress={(id) => console.log('Marker pressed:', id)}
      />

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
            <Text style={styles.statValue}>{formatDistance(walk.stats.distance)}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.onPrimary} />
            <Text style={styles.statValue}>{formatDuration(walk.stats.duration)}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="speedometer" size={20} color={COLORS.onPrimary} />
            <Text style={styles.statValue}>{walk.stats.averageSpeed.toFixed(1)} km/h</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="walk" size={20} color={COLORS.onPrimary} />
            <Text style={styles.statValue}>{walk.stats.steps || 0}</Text>
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
});
