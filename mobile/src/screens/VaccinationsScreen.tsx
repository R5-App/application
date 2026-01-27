import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { Pet } from '../types';

interface Vaccination {
  id: number;
  petId: number;
  vac_name: string;
  vaccination_date: string;
  expire_date?: string;
  costs?: string;
  notes?: string;
}

export default function VaccinationsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets and vaccinations from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both pets and vaccinations in parallel
        const [petsResponse, vaccinationsResponse] = await Promise.all([
          apiClient.get('/api/pets'),
          apiClient.get('/api/vaccinations')
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        if (vaccinationsResponse.data.success && vaccinationsResponse.data.data) {
          const vaccinationsData = vaccinationsResponse.data.data;
          
          // If nested structure (array of pet vaccination groups)
          if (Array.isArray(vaccinationsData) && vaccinationsData.length > 0 && vaccinationsData[0].vaccinations) {
            const flattenedVaccinations: Vaccination[] = [];
            vaccinationsData.forEach((petVacGroup: any) => {
              const petId = petVacGroup.pet_id;
              if (petVacGroup.vaccinations && Array.isArray(petVacGroup.vaccinations)) {
                petVacGroup.vaccinations.forEach((vac: any) => {
                  flattenedVaccinations.push({
                    ...vac,
                    petId: petId
                  });
                });
              }
            });
            setVaccinations(flattenedVaccinations);
          } else {
            // If flat structure
            setVaccinations(vaccinationsData);
          }
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

  const selectedPetVaccinations = vaccinations
    .filter(vac => vac.petId === selectedPetId)
    .sort((a, b) => new Date(b.vaccination_date).getTime() - new Date(a.vaccination_date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isOverdue = (expireDate?: string) => {
    if (!expireDate) return false;
    return new Date(expireDate) < new Date();
  };

  const renderVaccinationCard = (vaccination: Vaccination) => {
    const overdue = isOverdue(vaccination.expire_date);
    
    return (
      <Card key={vaccination.id} style={styles.vaccinationCard}>
        <Card.Content>
          <View style={styles.vaccinationHeader}>
            <Text variant="titleLarge" style={styles.vaccinationName}>
              {vaccination.vac_name}
            </Text>
            {vaccination.costs && (
              <Chip icon="currency-eur" compact>
                {vaccination.costs} €
              </Chip>
            )}
          </View>

          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
            <Text variant="titleMedium" style={styles.dateText}>
              Annettu: {formatDate(vaccination.vaccination_date)}
            </Text>
          </View>

          {vaccination.expire_date && (
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
                Voimassa: {formatDate(vaccination.expire_date)}
              </Text>
            </View>
          )}

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
