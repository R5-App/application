import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWalk } from '@contexts/WalkContext';
import { Walk } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../styles/theme';

export default function WalkHistoryScreen() {
  const navigation = useNavigation<any>();
  const { walks, deleteWalk, refreshWalks } = useWalk();
  const [selectedWalk, setSelectedWalk] = useState<Walk | null>(null);

  useEffect(() => {
    refreshWalks();
  }, []);

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

  const handleDeleteWalk = (id: string) => {
    Alert.alert(
      'Poista lenkki',
      'Haluatko varmasti poistaa tämän lenkin?',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            await deleteWalk(id);
            setSelectedWalk(null);
          },
        },
      ]
    );
  };

  const defaultStats: Walk['stats'] = { distance: 0, duration: 0, averageSpeed: 0, steps: 0, calories: 0 };

  const renderWalkItem = ({ item }: { item: Walk }) => {
    const stats = item.stats ?? defaultStats;
    return (
    <TouchableOpacity
      style={[
        styles.walkCard,
        selectedWalk?.id === item.id && styles.walkCardSelected,
      ]}
      onPress={() => setSelectedWalk(selectedWalk?.id === item.id ? null : item)}
      activeOpacity={0.7}
    >
      <View style={styles.walkCardHeader}>
        <View style={styles.walkCardIcon}>
          <MaterialCommunityIcons 
            name="paw" 
            size={LAYOUT.iconMd} 
            color={COLORS.primary} 
          />
        </View>
        <View style={styles.walkCardInfo}>
          <Text style={styles.walkCardTitle}>
            {item.petName}
          </Text>
          <Text style={styles.walkCardDate}>
            {formatDate(item.startTime)}
          </Text>
          <View style={styles.walkCardStats}>
            <Text style={styles.walkCardStatText}>
              {formatDistance(stats.distance)} • {formatDuration(stats.duration)}
            </Text>
          </View>
        </View>
        {!item.synced && (
          <MaterialCommunityIcons 
            name="cloud-upload-outline" 
            size={LAYOUT.iconSm} 
            color={COLORS.onSurfaceVariant} 
          />
        )}
      </View>

      {selectedWalk?.id === item.id && (
        <View style={styles.walkDetailsPanel}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons 
                name="speedometer" 
                size={LAYOUT.iconSm} 
                color={COLORS.primary} 
              />
              <Text style={styles.detailLabel}>Keskinopeus</Text>
              <Text style={styles.detailValue}>
                {(stats.averageSpeed ?? 0).toFixed(1)} km/h
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons 
                name="walk" 
                size={LAYOUT.iconSm} 
                color={COLORS.primary} 
              />
              <Text style={styles.detailLabel}>Askeleet</Text>
              <Text style={styles.detailValue}>
                {stats.steps || 0}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons 
                name="fire" 
                size={LAYOUT.iconSm} 
                color={COLORS.primary} 
              />
              <Text style={styles.detailLabel}>Kalorit</Text>
              <Text style={styles.detailValue}>
                {stats.calories || 0}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialCommunityIcons 
                name="map-marker-path" 
                size={LAYOUT.iconSm} 
                color={COLORS.primary} 
              />
              <Text style={styles.detailLabel}>Pisteet</Text>
              <Text style={styles.detailValue}>
                {item.coordinates.length}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.viewMapButton}
              onPress={() => navigation.navigate('WalkDetail', { walk: item })}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="map-outline" 
                size={LAYOUT.iconSm} 
                color={COLORS.primary} 
              />
              <Text style={styles.viewMapButtonText}>Näytä kartalla</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteWalk(item.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="delete-outline" 
                size={LAYOUT.iconSm} 
                color={COLORS.error} 
              />
              <Text style={styles.deleteButtonText}>Poista</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="run-fast" 
        size={LAYOUT.iconXl * 2} 
        color={COLORS.onSurfaceVariant} 
      />
      <Text style={styles.emptyStateTitle}>Ei tallennettuja lenkkejä</Text>
      <Text style={styles.emptyStateText}>
        Aloita ensimmäinen lenkkisi kartta-välilehdeltä
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lenkkihistoria</Text>
        <Text style={styles.headerSubtitle}>
          {walks.length} {walks.length === 1 ? 'lenkki' : 'lenkkiä'}
        </Text>
      </View>

      <FlatList
        data={walks.sort((a, b) => b.startTime - a.startTime)}
        renderItem={renderWalkItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMedium,
    color: COLORS.onPrimary,
    fontWeight: '600',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onPrimary,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  walkCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radiusMd,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  walkCardSelected: {
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  walkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walkCardIcon: {
    width: 48,
    height: 48,
    borderRadius: LAYOUT.radiusMd,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  walkCardInfo: {
    flex: 1,
  },
  walkCardTitle: {
    ...TYPOGRAPHY.titleMedium,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  walkCardDate: {
    ...TYPOGRAPHY.titleSmall,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  walkCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walkCardStatText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
  },
  walkDetailsPanel: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: LAYOUT.radiusSm,
    marginBottom: SPACING.sm,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  viewMapButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  detailLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  detailValue: {
    ...TYPOGRAPHY.titleMedium,
    color: COLORS.onSurface,
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  deleteButtonText: {
    ...TYPOGRAPHY.labelMedium,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.titleLarge,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  emptyStateText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
