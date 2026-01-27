import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { Pet } from '../types';

interface Medication {
  id: number;
  petId: number;
  med_name: string;
  medication_date: string;
  expire_date?: string;
  costs?: string;
  notes?: string;
}

export default function MedicationsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets and medications from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both pets and medications in parallel
        const [petsResponse, medicationsResponse] = await Promise.all([
          apiClient.get('/api/pets'),
          apiClient.get('/api/medications')
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        if (medicationsResponse.data.success && medicationsResponse.data.data) {
          // Check if medications are nested like visits
          const medicationsData = medicationsResponse.data.data;
          console.log('Medications response:', medicationsData);
          
          // If nested structure (array of pet medication groups)
          if (Array.isArray(medicationsData) && medicationsData.length > 0 && medicationsData[0].medications) {
            const flattenedMedications: Medication[] = [];
            medicationsData.forEach((petMedGroup: any) => {
              const petId = petMedGroup.pet_id;
              if (petMedGroup.medications && Array.isArray(petMedGroup.medications)) {
                petMedGroup.medications.forEach((med: any) => {
                  flattenedMedications.push({
                    ...med,
                    petId: petId
                  });
                });
              }
            });
            setMedications(flattenedMedications);
          } else {
            // If flat structure
            setMedications(medicationsData);
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

  const selectedPetMedications = medications
    .filter(med => med.petId === selectedPetId)
    .sort((a, b) => {
      // Sort by medication date, newest first
      return new Date(b.medication_date).getTime() - new Date(a.medication_date).getTime();
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderMedicationCard = (medication: Medication) => {
    const isExpired = medication.expire_date ? new Date(medication.expire_date) < new Date() : false;
    
    return (
      <Card key={medication.id} style={styles.medicationCard}>
        <Card.Content>
          <View style={styles.medicationHeader}>
            <Text variant="titleLarge" style={styles.medicationName}>
              {medication.med_name}
            </Text>
            {medication.costs && (
              <Chip icon="currency-eur" compact>
                {medication.costs} €
              </Chip>
            )}
          </View>

          <View style={styles.dosageContainer}>
            <MaterialCommunityIcons name="calendar-start" size={20} color={COLORS.primary} />
            <Text variant="titleMedium" style={styles.dosage}>
              Aloitettu: {formatDate(medication.medication_date)}
            </Text>
          </View>

          {medication.expire_date && (
            <View style={[styles.dosageContainer, { marginTop: SPACING.xs }]}>
              <MaterialCommunityIcons 
                name="calendar-end" 
                size={20} 
                color={isExpired ? '#D32F2F' : COLORS.onSurfaceVariant} 
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.dosage,
                  isExpired && { color: '#D32F2F', fontWeight: '600' }
                ]}
              >
                Vanhenee: {formatDate(medication.expire_date)}
              </Text>
            </View>
          )}

          {medication.notes && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons name="note-text" size={18} color={COLORS.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.notesText}>
                  {medication.notes}
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
      <MaterialCommunityIcons name="pill-off" size={64} color={COLORS.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        Ei lääkityksiä
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Lisää ensimmäinen lääkitys
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
        {selectedPetMedications.length === 0 ? (
          renderEmptyState()
        ) : (
          selectedPetMedications.map(renderMedicationCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Lisää lääkitys')}
        label="Lisää lääkitys"
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
  medicationCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  medicationName: {
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
  statusChip: {
    marginLeft: SPACING.sm,
  },
  activeChip: {
    backgroundColor: '#E8F5E9',
  },
  inactiveChip: {
    backgroundColor: COLORS.surfaceVariant,
  },
  activeChipText: {
    color: '#2E7D32',
  },
  inactiveChipText: {
    color: COLORS.onSurfaceVariant,
  },
  dosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  dosage: {
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  medicationDetail: {
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
