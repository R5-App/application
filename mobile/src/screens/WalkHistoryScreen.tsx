import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Portal, Dialog, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWalk } from '@contexts/WalkContext';
import { Walk, Pet } from '../types';
import apiClient from '../services/api';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '../styles/theme';

export default function WalkHistoryScreen() {
  const navigation = useNavigation<any>();
  const { walks, deleteWalk, refreshWalks } = useWalk();
  const [selectedWalk, setSelectedWalk] = useState<Walk | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [walkToDelete, setWalkToDelete] = useState<Walk | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    refreshWalks();
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const petsResponse = await apiClient.get('/api/pets');
      if (petsResponse.data.success && petsResponse.data.data) {
        const fetchedPets: Pet[] = petsResponse.data.data.map((pet: any) => ({
          ...pet,
          id: String(pet.id),
          role: pet.role || 'omistaja'
        }));
        setPets(fetchedPets);
      }
    } catch (error) {
      console.error('Failed to fetch pets:', error);
    }
  };

  const getPetRole = (petId: string): string | undefined => {
    return pets.find(p => p.id === petId)?.role;
  };

  // Filter walks - only show walks for pets where user is NOT hoitaja
  const filteredWalks = walks.filter(walk => {
    const role = getPetRole(walk.petId);
    return role !== 'hoitaja';
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWalks();
    setRefreshing(false);
  };

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

  const handleDeleteWalk = (walk: Walk) => {
    setWalkToDelete(walk);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteWalk = async () => {
    if (!walkToDelete) return;
    
    await deleteWalk(walkToDelete.id);
    setSelectedWalk(null);
    setDeleteDialogVisible(false);
    setWalkToDelete(null);
  };


  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, item: Walk) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteActionButton}
          onPress={() => handleDeleteWalk(item)}
        >
          <MaterialCommunityIcons name="delete" size={28} color={COLORS.onError} />
          <Text style={styles.deleteText}>Poista</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderWalkItem = ({ item }: { item: Walk }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      overshootRight={false}
      friction={2}
    >
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
              {formatDistance(item.distance)} • {formatDuration(item.duration)}
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
                {typeof item.averageSpeed === 'number' ? item.averageSpeed.toFixed(1) : '0.0'} km/h
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
                {item.steps || 0}
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
                {item.path?.length || 0}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {/* Only show map button for omistaja, hide for lääkäri */}
            {getPetRole(item.petId) !== 'lääkäri' && (
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
            )}
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteWalk(item)}
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
    </Swipeable>
  );

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
          {filteredWalks.length} {filteredWalks.length === 1 ? 'lenkki' : 'lenkkiä'}
        </Text>
      </View>

      <FlatList
        data={filteredWalks.sort((a, b) => b.startTime - a.startTime)}
        renderItem={renderWalkItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: COLORS.background }}
        >
          <Dialog.Title>Poista lenkki</Dialog.Title>
          <Dialog.Content>
            <Text style={{ ...TYPOGRAPHY.bodyMedium, color: COLORS.onSurface }}>
              Haluatko varmasti poistaa tämän lenkin?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Peruuta</Button>
            <Button onPress={confirmDeleteWalk} textColor={COLORS.error}>Poista</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primaryContainer,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMedium,
    color: COLORS.onPrimaryContainer,
    fontWeight: '400',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onPrimaryContainer,
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
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 100,
    marginVertical: SPACING.xs,
    marginRight: SPACING.md,
    borderRadius: LAYOUT.radiusMd,
  },
  deleteActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    paddingHorizontal: SPACING.sm,
  },
  deleteText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.onError,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});
