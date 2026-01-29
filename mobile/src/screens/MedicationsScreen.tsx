import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { medicationsStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { medicationsService } from '../services/medicationsService';
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
  const [editingMedicationId, setEditingMedicationId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
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
        
        const [petsResponse, fetchedMedications] = await Promise.all([
          apiClient.get('/api/pets'),
          medicationsService.getAllMedications()
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        setMedications(fetchedMedications);
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
    setIsEditMode(false);
    setEditingMedicationId(null);
    setMedName('');
    setMedicationDate(new Date().toISOString().split('T')[0]);
    setExpireDate('');
    setCosts('');
    setNotes('');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingMedicationId(null);
  };

  const handleSaveMedication = async () => {
    if (!medName) {
      alert('Täytä kaikki pakolliset kentät');
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && editingMedicationId) {

        const medicationData = {
          med_name: medName,
          medication_date: medicationDate,
          expire_date: expireDate || undefined,
          costs: costs ? parseFloat(costs) : undefined,
          notes: notes || undefined
        };

        const updatedMedication = await medicationsService.updateMedication(editingMedicationId, medicationData);

        if (updatedMedication) {
          // Refresh medications
          const refreshedMedications = await medicationsService.getAllMedications();
          setMedications(refreshedMedications);
          
          handleCloseModal();
        }
      } else { 
        if (!selectedPetId) {
          alert('Valitse lemmikki ennen tallentamista.');
          return;
        }
      
        const medicationData = {
          pet_id: selectedPetId,
          med_name: medName,
          medication_date: medicationDate,
          expire_date: expireDate || undefined,
          costs: costs ? parseFloat(costs) : undefined,
          notes: notes || undefined
        };

        const newMedication = await medicationsService.createMedication(medicationData);

        if (newMedication) {
          // Refresh medications
          const refreshedMedications = await medicationsService.getAllMedications();
          setMedications(refreshedMedications);
          
          handleCloseModal();
        }
      }
    } catch (err: any) {
      alert('Lääkityksen tallentaminen epäonnistui. Yritä uudelleen.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMedication = (medication: Medication) => {
    
    setIsEditMode(true);
    setEditingMedicationId(medication.id);

    const dateOnly = medication.medication_date.split('T')[0];
    setMedName(medication.med_name);
    setMedicationDate(dateOnly);
    const expireDateOnly = medication.expire_date ? medication.expire_date.split('T')[0] : '';
    setExpireDate(expireDateOnly);
    setCosts(medication.costs || '');
    setNotes(medication.notes || '');
    setModalVisible(true);
  };

  const handleDeleteMedication = async (medication: Medication) => {
    if (window.confirm('Haluatko varmasti poistaa tämän lääkityksen?')) {
      try {
        const success = await medicationsService.deleteMedication(medication.id);

        if (success) {
          // Refresh medications
          const refreshedMedications = await medicationsService.getAllMedications();
          setMedications(refreshedMedications);
        } else {
          alert('Lääkityksen poistaminen epäonnistui. Yritä uudelleen.');
        }
      } catch (err: any) {
        console.error("Failed to delete medication:", err);
        alert('Lääkityksen poistaminen epäonnistui. Yritä uudelleen.');
      }
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

          <Divider style={styles.divider} />

          <View style={styles.bottomSection}>
            {medication.notes ? (
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons name="note-text" size={18} color={COLORS.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.notesText}>
                  {medication.notes}
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEditMedication(medication)} style={styles.actionButton}>
                <MaterialCommunityIcons name="pencil" size={25} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteMedication(medication)} style={styles.actionButton}>
                <MaterialCommunityIcons name="delete" size={25} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
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
              {isEditMode ? 'Muokkaa lääkitystä' : 'Lisää lääkitys'}
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

