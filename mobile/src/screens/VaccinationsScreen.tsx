import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { Pet } from '../types';

interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: string;
  nextDueDate?: string;
  batchNumber?: string;
  veterinarian: string;
  clinic: string;
  notes?: string;
  isUpToDate: boolean;
}

export default function VaccinationsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations] = useState<Vaccination[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets from the API
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get('/api/pets');
        
        if (response.data.success && response.data.data) {
          const fetchedPets = response.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch pets:', err);
        setError('Lemmikit eivät latautuneet. Yritä uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const selectedPetVaccinations = vaccinations
    .filter(vac => vac.petId === selectedPetId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isOverdue = (nextDueDate?: string) => {
    if (!nextDueDate) return false;
    return new Date(nextDueDate) < new Date();
  };

  const renderVaccinationCard = (vaccination: Vaccination) => {
    const overdue = isOverdue(vaccination.nextDueDate);
    
    return (
      <Card key={vaccination.id} style={styles.vaccinationCard}>
        <Card.Content>
          <View style={styles.vaccinationHeader}>
            <Text variant="titleLarge" style={styles.vaccinationName}>
              {vaccination.name}
            </Text>
            <Chip
              icon={
                overdue ? 'alert-circle' : 
                vaccination.isUpToDate ? 'check-circle' : 'clock-outline'
              }
              compact
              style={[
                styles.statusChip,
                overdue ? styles.overdueChip :
                vaccination.isUpToDate ? styles.upToDateChip : styles.pendingChip
              ]}
              textStyle={
                overdue ? styles.overdueChipText :
                vaccination.isUpToDate ? styles.upToDateChipText : styles.pendingChipText
              }
            >
              {overdue ? 'Myöhässä' : vaccination.isUpToDate ? 'Voimassa' : 'Odottaa'}
            </Chip>
          </View>

          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
            <Text variant="titleMedium" style={styles.dateText}>
              Annettu: {formatDate(vaccination.date)}
            </Text>
          </View>

          {vaccination.nextDueDate && (
            <View style={[styles.dateContainer, { marginTop: SPACING.xs }]}>
              <MaterialCommunityIcons 
                name="calendar-clock" 
                size={20} 
                color={overdue ? '#D32F2F' : COLORS.onSurfaceVariant} 
              />
              <Text 
                variant="bodyMedium" 
                style={[styles.nextDueText, overdue && styles.overdueText]}
              >
                Voimassa: {formatDate(vaccination.nextDueDate)}
              </Text>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.vaccinationDetail}>
            <MaterialCommunityIcons name="hospital-building" size={18} color={COLORS.onSurfaceVariant} />
            <Text variant="bodyMedium" style={styles.detailText}>
              {vaccination.clinic}
            </Text>
          </View>

          <View style={styles.vaccinationDetail}>
            <MaterialCommunityIcons name="doctor" size={18} color={COLORS.onSurfaceVariant} />
            <Text variant="bodyMedium" style={styles.detailText}>
              {vaccination.veterinarian}
            </Text>
          </View>

          {vaccination.notes && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons name="note-text" size={18} color={COLORS.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.notesText}>
                  {vaccination.notes}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="needle-off" size={64} color={COLORS.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        Ei rokotuksia
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Lisää ensimmäinen rokotus
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
        {selectedPetVaccinations.length === 0 ? (
          renderEmptyState()
        ) : (
          selectedPetVaccinations.map(renderVaccinationCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Lisää rokotus')}
        label="Lisää rokotus"
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
  vaccinationCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  vaccinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  vaccinationName: {
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  statusChip: {
    marginLeft: SPACING.sm,
  },
  upToDateChip: {
    backgroundColor: '#E8F5E9',
  },
  pendingChip: {
    backgroundColor: '#FFF8E1',
  },
  overdueChip: {
    backgroundColor: '#FFEBEE',
  },
  upToDateChipText: {
    color: '#2E7D32',
  },
  pendingChipText: {
    color: '#F57C00',
  },
  overdueChipText: {
    color: '#D32F2F',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  nextDueText: {
    color: COLORS.onSurfaceVariant,
  },
  overdueText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  vaccinationDetail: {
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
