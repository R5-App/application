import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator, Portal, Modal, TextInput, Button, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { visitsStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { visitsService } from '../services/visitsService';
import { Pet } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SwipeableCard } from '../components/SwipeableCard';

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

interface VisitType {
  id: number;
  name: string;
}

export default function VisitsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [editingVisitId, setEditingVisitId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const costsInputRef = useRef<any>(null);
  const notesInputRef = useRef<any>(null);
  
  // Form state
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vetName, setVetName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [costs, setCosts] = useState<string>('');

  // Fetch pets and visits from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch pets and visits in parallel
        const [petsResponse, fetchedVisits] = await Promise.all([
          apiClient.get('/api/pets'),
          visitsService.getAllVisits()
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        setVisits(fetchedVisits);
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
    .filter(visit => selectedPetId && visit.pet_id === parseInt(selectedPetId))
    .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());

  const handleOpenModal = async () => {
    // Reset form for create mode
    setIsEditMode(false);
    setEditingVisitId(null);
    setVisitDate(new Date().toISOString().split('T')[0]);
    setVetName('');
    setLocation('');
    setSelectedTypeId(null);
    setNotes('');
    setCosts('');
    setModalVisible(true);
    
    // Fetch visit types if not already loaded
    if (visitTypes.length === 0) {
      try {
        const types = await visitsService.getVisitTypes();
        console.log('Visit types response:', types);
        setVisitTypes(types);
      } catch (err: any) {
        console.error('Failed to fetch visit types:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingVisitId(null);
  };

  const handleSaveVisit = async () => {
    if (!vetName || !location || !selectedTypeId) {
      alert('Täytä kaikki pakolliset kentät');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditMode && editingVisitId) {
        
        const visitData = {
          visit_date: visitDate,
          vet_name: vetName,
          location: location,
          type_id: selectedTypeId,
          notes: notes || undefined,
          costs: costs ? parseFloat(costs) : undefined
        };

        const updatedVisit = await visitsService.updateVisit(editingVisitId, visitData);

        if (updatedVisit) {
          // Refresh visits
          const refreshedVisits = await visitsService.getAllVisits();
          setVisits(refreshedVisits);
          handleCloseModal();
        }
      } else {
        // Create new visit
        if (!selectedPetId) {
          alert('Valitse lemmikki');
          return;
        }
        
        const visitData = {
          pet_id: parseInt(selectedPetId!),
          visit_date: visitDate,
          vet_name: vetName,
          location: location,
          type_id: selectedTypeId,
          notes: notes || undefined,
          costs: costs ? parseFloat(costs) : undefined
        };

        const newVisit = await visitsService.createVisit(visitData);

        if (newVisit) {
          // Refresh visits
          const refreshedVisits = await visitsService.getAllVisits();
          setVisits(refreshedVisits);
          handleCloseModal();
        }
      }
    } catch (err: any) {
      console.error('Failed to save visit:', err);
      alert('Käynnin tallentaminen epäonnistui. Yritä uudelleen.');
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

  const handleEditVisit = async (visit: Visit) => {
    // Set edit mode
    setIsEditMode(true);
    setEditingVisitId(visit.id);
    
    // Fetch visit types first if not already loaded
    let types = visitTypes;
    if (types.length === 0) {
      try {
        types = await visitsService.getVisitTypes();
        setVisitTypes(types);
      } catch (err: any) {
        console.error('Failed to fetch visit types:', err);
      }
    }
    
    // Pre-fill form with visit data
    // Extract date only (remove timestamp if present)
    const dateOnly = visit.visit_date.split('T')[0];
    setVisitDate(dateOnly);
    setVetName(visit.vet_name);
    setLocation(visit.location);
    
    // Find the type by name (since type_id stores the name, not ID)
    const matchingType = types.find(t => t.name.toLowerCase() === visit.type_id.toLowerCase());
    if (matchingType) {
      setSelectedTypeId(matchingType.id);
    }
    
    setNotes(visit.notes || '');
    setCosts(visit.costs || '');
    
    setModalVisible(true);
  };

  const handleDeleteVisit = (visit: Visit) => {
    setVisitToDelete(visit);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteVisit = async () => {
    if (!visitToDelete) return;

    try {
      const success = await visitsService.deleteVisit(visitToDelete.id);
      
      if (success) {
        // Refresh visits
        const refreshedVisits = await visitsService.getAllVisits();
        setVisits(refreshedVisits);
        setDeleteDialogVisible(false);
        setVisitToDelete(null);
      } else {
        alert('Käynnin poistaminen epäonnistui.');
      }
    } catch (err: any) {
      console.error('Failed to delete visit:', err);
      alert('Käynnin poistaminen epäonnistui. Yritä uudelleen.');
    }
  };

  const renderVisitCard = (visit: Visit) => (
    <SwipeableCard
      key={visit.id}
      onEdit={() => handleEditVisit(visit)}
      onDelete={() => handleDeleteVisit(visit)}
    >
      <Card style={styles.visitCard}>
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

        <Divider style={styles.divider} />
        
        <View style={styles.bottomSection}>
          {visit.notes && (
            <View style={styles.notesContainer}>
              <MaterialCommunityIcons name="note-text" size={18} color={COLORS.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.notesText}>
                {visit.notes}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
      </Card>
    </SwipeableCard>
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
                color={selectedPetId === pet.id ? COLORS.onPrimary : COLORS.onSurfaceVariant} 
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
        onPress={handleOpenModal}
        label="Lisää käynti"
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
              {isEditMode ? 'Muokkaa käyntiä' : 'Lisää käynti'}
            </Text>

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Päivämäärä"
                value={new Date(visitDate).toLocaleDateString('fi-FI')}
                style={styles.input}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                placeholder="PP-KK-VVVV"
                placeholderTextColor={COLORS.placeholderText}
                textColor={COLORS.onSurface}
                theme={{ colors: { onSurfaceVariant: COLORS.onSurfaceVariant } }}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(visitDate)}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setVisitDate(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}

            <TextInput
              label="Eläinlääkäri *"
              value={vetName}
              onChangeText={setVetName}
              style={styles.input}
              mode="outlined"
              placeholder="Ell. Virtanen"
              placeholderTextColor={COLORS.placeholderText}
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: COLORS.onSurfaceVariant } }}
            />

            <TextInput
              label="Paikka *"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              mode="outlined"
              placeholder="Eläinklinikka Keskusta"
              placeholderTextColor={COLORS.placeholderText}
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: COLORS.onSurfaceVariant } }}
            />


            <Text style={{ marginBottom: 8, color: COLORS.onSurfaceVariant }}>
              Käynnin tyyppi 
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'row', marginBottom: SPACING.md }}
            >
              {visitTypes.length > 0 ? (
                visitTypes.map((type) => (
                  <Button
                    key={type.id}
                    mode={selectedTypeId === type.id ? 'contained' : 'outlined'}
                    onPress={() => setSelectedTypeId(type.id)}
                    style={{
                      marginRight: SPACING.sm,
                      borderColor: COLORS.primary,
                      backgroundColor: selectedTypeId === type.id ? COLORS.primary : COLORS.surface,
                      minWidth: 100,
                      borderRadius: 20,
                      elevation: selectedTypeId === type.id ? 2 : 0,
                    }}
                    labelStyle={{
                      color: selectedTypeId === type.id ? COLORS.onPrimary : COLORS.primary,
                      fontWeight: selectedTypeId === type.id ? 'bold' : 'normal',
                      textTransform: 'none',
                    }}
                  >
                    {type.name}
                  </Button>
                ))
              ) : (
                <Button disabled mode="outlined">Ladataan...</Button>
              )}
            </ScrollView>

            <TextInput
              ref={costsInputRef}
              label="Kustannukset (€)"
              value={costs}
              onChangeText={setCosts}
              style={styles.input}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder=""
              placeholderTextColor={COLORS.placeholderText}
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: COLORS.onSurfaceVariant } }}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <TextInput
              ref={notesInputRef}
              label="Muistiinpanot"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Lisää muistiinpanoja..."
              placeholderTextColor={COLORS.placeholderText}
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: COLORS.onSurfaceVariant } }}
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
                onPress={handleSaveVisit}
                style={styles.modalButton}
                loading={saving}
                disabled={saving}
              >
                Tallenna
              </Button>
            </View>
          </ScrollView>
        </Modal>

        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: COLORS.background }}
        >
          <Dialog.Title>Poista käynti</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {visitToDelete && `Haluatko varmasti poistaa käynnin ${formatDate(visitToDelete.visit_date)}?`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Peruuta</Button>
            <Button onPress={confirmDeleteVisit} textColor={COLORS.error}>Poista</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

