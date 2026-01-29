import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { vaccinationsStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { vaccinationsService } from '../services/vaccinationsService';
import { Pet } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Vaccination {
  id: number;
  pet_id: number;
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
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showVaccinationDatePicker, setShowVaccinationDatePicker] = useState<boolean>(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState<boolean>(false);
  const [editingVaccinationId, setEditingVaccinationId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [vacName, setVacName] = useState<string>('');
  const [vaccinationDate, setVaccinationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expireDate, setExpireDate] = useState<string>('');
  const [costs, setCosts] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch pets and vaccinations from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [petsResponse, fetchedVaccinations] = await Promise.all([
          apiClient.get('/api/pets'),
          vaccinationsService.getAllVaccinations()
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        setVaccinations(fetchedVaccinations);
      } catch (err: any) {
        setError('Tietojen lataus epäonnistui. Yritä uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedPetVaccinations = vaccinations
    .filter(vac => vac.pet_id === selectedPetId)
    .sort((a, b) => new Date(b.vaccination_date).getTime() - new Date(a.vaccination_date).getTime());

  const handleOpenModal = () => {
    // Reset form for create mode
    setIsEditMode(false);
    setEditingVaccinationId(null);
    setVacName('');
    setVaccinationDate(new Date().toISOString().split('T')[0]);
    setExpireDate('');
    setCosts('');
    setNotes('');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingVaccinationId(null);
  };

  const handleSaveVaccination = async () => {
    if (!vacName) {
      alert('Täytä kaikki pakolliset kentät');
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && editingVaccinationId) {
      
        const vaccinationData = {
          pet_id: selectedPetId,
          vac_name: vacName,
          vaccination_date: vaccinationDate,
          expire_date: expireDate || undefined,
          costs: costs ? parseFloat(costs) : undefined,
          notes: notes || undefined
        };

        const updatedVaccination = await vaccinationsService.updateVaccination(editingVaccinationId, vaccinationData);

        if (updatedVaccination) {
          // Refresh vaccinations
          const refreshedVaccinations = await vaccinationsService.getAllVaccinations();
          setVaccinations(refreshedVaccinations);
          
          handleCloseModal();
        }
      } else {
        if (!selectedPetId) {
          alert('Valitse lemmikki ennen tallentamista.');
          return;
        }

        const vaccinationData = {
          pet_id: selectedPetId,
          vac_name: vacName,
          vaccination_date: vaccinationDate,
          expire_date: expireDate || undefined,
          costs: costs ? parseFloat(costs) : undefined,
          notes: notes || undefined
        };

        const newVaccination = await vaccinationsService.createVaccination(vaccinationData);

        if (newVaccination) {
          // Refresh vaccinations
          const refreshedVaccinations = await vaccinationsService.getAllVaccinations();
          setVaccinations(refreshedVaccinations);
          
          handleCloseModal();
        }
      }
    } catch (err: any) {
      alert('Rokotuksen tallentaminen epäonnistui. Yritä uudelleen.');
    } finally {
      setSaving(false);
    }
  };

    const handleEditVaccination = (vaccination: Vaccination) => {
      setIsEditMode(true);
      setEditingVaccinationId(vaccination.id);

      const dateOnly = vaccination.vaccination_date.split('T')[0];
      setVacName(vaccination.vac_name);
      setVaccinationDate(dateOnly);
      const expireDateOnly = vaccination.expire_date ? vaccination.expire_date.split('T')[0] : '';
      setExpireDate(expireDateOnly);
      setCosts(vaccination.costs ? vaccination.costs.toString() : '');
      setNotes(vaccination.notes || '');
      setModalVisible(true);
  };

  const handleDeleteVaccination = async (vaccination: Vaccination) => {
    if (confirm('Haluatko varmasti poistaa tämän rokotuksen?')) {
      try {
        const response = await vaccinationsService.deleteVaccination(vaccination.id);

        if (response) {
          // Refresh vaccinations
          const refreshedVaccinations = await vaccinationsService.getAllVaccinations();
          setVaccinations(refreshedVaccinations);
        } else {
          alert('Rokotuksen poistaminen epäonnistui. Yritä uudelleen.');
        }
      } catch (err: any) {
        console.error("Failed to delete vaccination:", err);
        alert('Rokotuksen poistaminen epäonnistui. Yritä uudelleen.');
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

  const renderVaccinationCard = (vaccination: Vaccination) => {
    const isExpired = vaccination.expire_date ? new Date(vaccination.expire_date) < new Date() : false;
    
    return (
      <Card key={vaccination.id} style={styles.vaccinationCard}>
        <Card.Content>
          <View style={styles.vaccinationHeader}>
            <Text variant="titleLarge" style={styles.vaccinationName}>
              {vaccination.vac_name}
            </Text>
            {vaccination.costs && (
              <Chip compact>
                {vaccination.costs} €
              </Chip>
            )}
          </View>

          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
            <Text variant="titleMedium" style={styles.dateText}>
              Rokotettu: {formatDate(vaccination.vaccination_date)}
            </Text>
          </View>

          {vaccination.expire_date && (
            <View style={[styles.dateContainer, { marginTop: SPACING.xs }]}>
              <MaterialCommunityIcons 
                name={isExpired ? "calendar-alert" : "calendar-refresh"} 
                size={20} 
                color={isExpired ? '#D32F2F' : COLORS.onSurfaceVariant} 
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.dateText,
                  isExpired && { color: '#D32F2F', fontWeight: '600' }
                ]}
              >
                {isExpired ? 'Vanhentunut' : 'Uusittava'}: {formatDate(vaccination.expire_date)}
              </Text>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.bottomSection}>
            {vaccination.notes ? (
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons name="note-text" size={18} color={COLORS.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.notesText}>
                  {vaccination.notes}
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEditVaccination(vaccination)} style={styles.actionButton}>
                <MaterialCommunityIcons name="pencil" size={25} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteVaccination(vaccination)} style={styles.actionButton}>
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
        onPress={handleOpenModal}
        label="Lisää rokotus"
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
              {isEditMode ? 'Muokkaa rokotusta' : 'Lisää rokotus'}
            </Text>

            <TextInput
              label="Rokotteen nimi *"
              value={vacName}
              onChangeText={setVacName}
              style={styles.input}
              mode="outlined"
              placeholder="Esim. Raivotautirokote"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
            />

            <TouchableOpacity onPress={() => setShowVaccinationDatePicker(true)}>
              <TextInput
                label="Rokotuspäivä *"
                value={vaccinationDate.split('-').reverse().join('-')}
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

            {showVaccinationDatePicker && (
              <DateTimePicker
                value={new Date(vaccinationDate)}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowVaccinationDatePicker(false);
                  if (selectedDate) {
                    setVaccinationDate(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}

            <TouchableOpacity onPress={() => setShowExpireDatePicker(true)}>
              <TextInput
                label="Uusimispäivä"
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
              placeholder="Vuosittainen tehoste"
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
                onPress={handleSaveVaccination}
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

