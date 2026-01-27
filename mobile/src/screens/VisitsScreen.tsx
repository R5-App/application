import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { Pet } from '../types';

interface Visit {
  id: number;
  pet_id: number;
  visit_date: string;
  location: string;
  vet_name: string;
  type_id: string;
  notes?: string;
  costs?: string;
}

export default function VisitsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets and visits from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both pets and visits in parallel
        const [petsResponse, visitsResponse] = await Promise.all([
          apiClient.get('/api/pets'),
          apiClient.get('/api/vet-visits')
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        if (visitsResponse.data.success && visitsResponse.data.data) {
          // Flatten the nested structure: each pet has a vet_visits array
          const flattenedVisits: Visit[] = [];
          visitsResponse.data.data.forEach((petVisitGroup: any) => {
            const petId = petVisitGroup.pet_id;
            if (petVisitGroup.vet_visits && Array.isArray(petVisitGroup.vet_visits)) {
              petVisitGroup.vet_visits.forEach((visit: any) => {
                flattenedVisits.push({
                  ...visit,
                  pet_id: petId
                });
              });
            }
          });
          setVisits(flattenedVisits);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Tietojen lataus epäonnistui. Yritä uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedPetVisits = visits
    .filter(visit => visit.pet_id === selectedPetId)
    .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderVisitCard = (visit: Visit) => (
    <Card key={visit.id} style={styles.visitCard}>
      <Card.Content>
        <View style={styles.visitHeader}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
            <Text variant="titleMedium" style={styles.dateText}>
              {formatDate(visit.visit_date)}
            </Text>
          </View>
          {visit.costs && (
            <Chip compact>
              {visit.costs} €
            </Chip>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.visitDetail}>
          <MaterialCommunityIcons name="hospital-building" size={18} color={COLORS.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.detailText}>
            {visit.location}
          </Text>
        </View>

        <View style={styles.visitDetail}>
          <MaterialCommunityIcons name="doctor" size={18} color={COLORS.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.detailText}>
            {visit.vet_name}
          </Text>
        </View>

        <View style={styles.visitDetail}>
          <MaterialCommunityIcons name="stethoscope" size={18} color={COLORS.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.detailText}>
            {visit.type_id}
          </Text>
        </View>

        {visit.notes && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.notesContainer}>
              <MaterialCommunityIcons name="note-text" size={18} color={COLORS.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.notesText}>
                {visit.notes}
              </Text>
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="hospital-box-outline" size={64} color={COLORS.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        Ei käyntejä
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Lisää ensimmäinen eläinlääkärikäynti
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text variant="bodyMedium" style={[styles.emptyText, { marginTop: SPACING.md }]}>
            Ladataan lemmikkejä...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={COLORS.error} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Virhe
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="paw-off" size={64} color={COLORS.onSurfaceVariant} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Ei lemmikkejä
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Lisää ensin lemmikki
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {pets.map((pet) => (
          <Chip
            key={pet.id}
            selected={selectedPetId === pet.id}
            onPress={() => setSelectedPetId(pet.id)}
            style={[
              styles.tab,
              selectedPetId === pet.id && styles.selectedTab
            ]}
            textStyle={selectedPetId === pet.id ? styles.selectedTabText : styles.unselectedTabText}
            icon={() => (
              <MaterialCommunityIcons 
                name="paw" 
                size={18} 
                color={selectedPetId === pet.id ? '#FFFFFF' : COLORS.onSurfaceVariant} 
              />
            )}
          >
            {pet.name}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedPetVisits.length === 0 ? (
          renderEmptyState()
        ) : (
          selectedPetVisits.map(renderVisitCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Lisää käynti')}
        label="Lisää käynti"
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.onBackground,
  },
  tabsContainer: {
    maxHeight: 70,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  tab: {
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },
  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
  },
  unselectedTabText: {
    fontSize: 15,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  visitCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  visitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  detailText: {
    flex: 1,
    color: COLORS.onSurface,
  },
  notesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  notesText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.onSurfaceVariant,
  },
  emptyText: {
    marginTop: SPACING.xs,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
});
