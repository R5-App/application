import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { Pet } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Medication {
  id: number;
  pet_id: number;
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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showMedicationDatePicker, setShowMedicationDatePicker] = useState<boolean>(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState<boolean>(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [medName, setMedName] = useState<string>('');
  const [medicationDate, setMedicationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expireDate, setExpireDate] = useState<string>('');
  const [costs, setCosts] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch pets and medications from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [petsResponse, medicationsResponse] = await Promise.all([
          apiClient.get('/api/pets'),
          apiClient.get('/api/medications')
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        if (medicationsResponse.data.success && medicationsResponse.data.data) {
          const medicationsData = medicationsResponse.data.data;
          
          if (Array.isArray(medicationsData) && medicationsData.length > 0 && medicationsData[0].medications) {
            const flattenedMedications: Medication[] = [];
            medicationsData.forEach((petMedGroup: any) => {
              const petId = petMedGroup.pet_id;
              if (petMedGroup.medications && Array.isArray(petMedGroup.medications)) {
                petMedGroup.medications.forEach((med: any) => {
                  flattenedMedications.push({
                    ...med,
                    pet_id: petId
                  });
                });
              }
            });
            setMedications(flattenedMedications);
          } else {
            setMedications(medicationsData);
          }
        }
      } catch (err: any) {
        setError('Tietojen lataus epäonnistui. Yritä uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedPetMedications = medications
    .filter(med => med.pet_id === selectedPetId)
    .sort((a, b) => new Date(b.medication_date).getTime() - new Date(a.medication_date).getTime());

  const handleOpenModal = () => {
    setMedName('');
    setMedicationDate(new Date().toISOString().split('T')[0]);
    setExpireDate('');
    setCosts('');
    setNotes('');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSaveMedication = async () => {
    if (!selectedPetId || !medName) {
      alert('Täytä kaikki pakolliset kentät');
      return;
    }

    try {
      setSaving(true);
      
      const medicationData = {
        pet_id: selectedPetId,
        med_name: medName,
        medication_date: medicationDate,
        expire_date: expireDate || undefined,
        costs: costs ? parseFloat(costs) : undefined,
        notes: notes || undefined
      };

      const response = await apiClient.post('/api/medications', medicationData);

      if (response.data.success) {
        const medicationsResponse = await apiClient.get('/api/medications');
        if (medicationsResponse.data.success && medicationsResponse.data.data) {
          const medicationsData = medicationsResponse.data.data;
          
          if (Array.isArray(medicationsData) && medicationsData.length > 0 && medicationsData[0].medications) {
            const flattenedMedications: Medication[] = [];
            medicationsData.forEach((petMedGroup: any) => {
              const petId = petMedGroup.pet_id;
              if (petMedGroup.medications && Array.isArray(petMedGroup.medications)) {
                petMedGroup.medications.forEach((med: any) => {
                  flattenedMedications.push({
                    ...med,
                    pet_id: petId
                  });
                });
              }
            });
            setMedications(flattenedMedications);
          } else {
            setMedications(medicationsData);
          }
        }
        
        handleCloseModal();
      }
    } catch (err: any) {
      alert('Lääkityksen tallentaminen epäonnistui. Yritä uudelleen.');
    } finally {
      setSaving(false);
    }
  };

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
              <Chip compact>
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
        onPress={handleOpenModal}
        label="Lisää lääkitys"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleCloseModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContentContainer}
          >
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Lisää lääkitys
            </Text>

            <TextInput
              label="Lääkkeen nimi *"
              value={medName}
              onChangeText={setMedName}
              style={styles.input}
              mode="outlined"
              placeholder="Esim. Antibiootit"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
            />

            <TouchableOpacity onPress={() => setShowMedicationDatePicker(true)}>
              <TextInput
                label="Lääkityksen aloituspäivä *"
                value={medicationDate.split('-').reverse().join('-')}
                style={styles.input}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                placeholder="PP-KK-VVVV"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                textColor={COLORS.onSurface}
                theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
              />
            </TouchableOpacity>

            {showMedicationDatePicker && (
              <DateTimePicker
                value={new Date(medicationDate)}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowMedicationDatePicker(false);
                  if (selectedDate) {
                    setMedicationDate(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}

            <TouchableOpacity onPress={() => setShowExpireDatePicker(true)}>
              <TextInput
                label="Vanhenemispäivä"
                value={expireDate ? expireDate.split('-').reverse().join('-') : ''}
                style={styles.input}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                placeholder="PP-KK-VVVV (valinnainen)"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                textColor={COLORS.onSurface}
                theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
              />
            </TouchableOpacity>

            {showExpireDatePicker && (
              <DateTimePicker
                value={expireDate ? new Date(expireDate) : new Date()}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowExpireDatePicker(false);
                  if (selectedDate) {
                    setExpireDate(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}

            <TextInput
              label="Kustannukset (€)"
              value={costs}
              onChangeText={setCosts}
              style={styles.input}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder=""
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <TextInput
              label="Muistiinpanot"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Anna ruoan kanssa kahdesti päivässä"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCloseModal}
                style={styles.modalButton}
                disabled={saving}
              >
                Peruuta
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveMedication}
                style={styles.modalButton}
                loading={saving}
                disabled={saving}
              >
                Tallenna
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },
  scrollContentContainer: {
    paddingBottom: 0,
  },
  modalTitle: {
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
  },
  input: {
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});
