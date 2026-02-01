import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import apiClient from '../services/api'; // petapp api
import { Pet } from '../types';
import { COLORS, SPACING } from '../styles/theme';
import { calculateAge, formatDate } from '../helpers';

export default function PetDetailsScreen() {

  const route = useRoute(); // access to route params
  const navigation = useNavigation();
  const { petId } = route.params as { petId: string };  // Extract the petId from route params

  const [pet, setPet] = useState<Pet | null>(null);  // Storing pet object that we got from API (null until loaded)
  const [loading, setLoading] = useState(true);   // Tracks whether data is still being fetched from the API
  const [editDialogVisible, setEditDialogVisible] = useState(false); // modal popip visibility

  // For editing pet name, breed,age etc:
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editSex, setEditSex] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const [isSaving, setIsSaving] = useState(false); // track saving (prevent double clicks)
  const [isDeleting, setIsDeleting] = useState(false); // same as above but for deleting

  useEffect(() => {
    fetchPetDetails();
  }, []);


  // Fetch pet data
  const fetchPetDetails = async () => {
    try {
      const response = await apiClient.get(`/api/pets/${petId}`); // fetch pet by id (GET request)
      
      if (response.data.success) {
        setPet(response.data.data); // store pet data in state
      }
    } catch (error) {
      Alert.alert('Virhe', 'Lemmikin tietojen lataus epäonnistui');
    } finally {
      setLoading(false); // mark loading as complete
    }
  };

  // Open edit dialog
  const handleEditPet = () => {
    if (pet) { // Only proceed if pet data has loaded
      // Pre-fill the fields with the current pet's data
      setEditName(pet.name);
      setEditType(pet.type);
      setEditBreed(pet.breed);
      setEditSex(pet.sex);
      setEditBirthdate(pet.birthdate);
      setEditNotes(pet.notes || '');
      setEditDialogVisible(true); // Show the edit dialog modal to the user
    }
  };

  // Save edited pet data
  const handleSavePet = async () => {
    if (!editName || !editBreed || !editType || !editSex) {  // Validate that required fields are filled in
      Alert.alert('Virhe', 'Täytä kaikki pakolliset kentät');
      return; // Exit early if validation fails
    }

    // Validate birthdate format (should be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editBirthdate)) {
      Alert.alert('Virhe', 'Syntymäpäivä pitää olla muodossa VVVV-KK-PP');
      return;
    }
    setIsSaving(true); // Mark save operation as in progress (to disable buttons and show loading)
    
 // Send updated pet data to API (PUT request)
    try {
      const response = await apiClient.put(`/api/pets/${petId}`, {
        name: editName,
        type: editType,
        breed: editBreed,
        sex: editSex,
        birthdate: editBirthdate,
        notes: editNotes,
      });

      if (response.data.success) { // Check if API response indicates success
        setPet(response.data.data); // Update the displayed pet data with the new values from API
        setEditDialogVisible(false); // Close the edit dialog
        Alert.alert('Onnistui', 'Lemmikin tiedot päivitetty');
      }
    } catch (error) {
      Alert.alert('Virhe', 'Päivitys epäonnistui');
    } finally {
      setIsSaving(false);
    }
  };

// Deleting pet + confirmation
  const handleDeletePet = () => {
    Alert.alert(
      'Poista lemmikki',
      `Haluatko varmasti poistaa lemmikin "${pet?.name}"?`,
      [
        // Button 1: Cancel button, closes dialog
        { text: 'Peruuta', style: 'cancel' },
        
        // Button 2: Confirm delete button
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);  // Mark delete operation as in progress
            
            try {
              await apiClient.delete(`/api/pets/${petId}`); // Send DELETE request to API to remove the pet
              Alert.alert('Onnistui', 'Lemmikki poistettu');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Virhe', 'Poistaminen epäonnistui');
            } finally {
              setIsDeleting(false); // Mark delete operation as complete
            }
          },
        },
      ]
    );
  };


// show while data is being fetched)
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Ladataan...</Text>
      </View>
    );
  }

// if pet data couldn't be found/loaded)
  if (!pet) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Lemmikkiä ei löytynyt</Text>
      </View>
    );
  }


// Show pet details when data is loaded successfully
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      
      {/*HEADER*/}
      {/* Display pet icon and name at top with colored background */}
      <View style={{ padding: SPACING.lg, backgroundColor: COLORS.primaryContainer }}>
        
        {/* Paw icon */}
        <MaterialCommunityIcons 
          name="paw" 
          size={80} 
          color={COLORS.onPrimaryContainer}
          style={{ textAlign: 'center' }}
        />
        
        {/* headline (pet name) */}
        <Text 
          variant="headlineMedium" 
          style={{ 
            color: COLORS.onPrimaryContainer, 
            textAlign: 'center',
            marginTop: SPACING.md
          }}
        >
          {pet.name}
        </Text>
      </View>

      {/*PET INFORMATION*/}
      <Card style={{ margin: SPACING.lg }}>
        <Card.Content>
                    
          {/*Type*/}
          <View style={{ marginBottom: SPACING.md }}>
            <Text variant="labelMedium" style={{ color: COLORS.onSurfaceVariant }}>
              Lajityyppi
            </Text>
            <Text variant="bodyLarge">{pet.type || 'Ei tiedossa'}</Text>
          </View>

          {/*Breed*/}
          <View style={{ marginBottom: SPACING.md }}>
            <Text variant="labelMedium" style={{ color: COLORS.onSurfaceVariant }}>
              Rotu
            </Text>
            <Text variant="bodyLarge">{pet.breed}</Text>
          </View>

          {/*Sex*/}
          <View style={{ marginBottom: SPACING.md }}>
            <Text variant="labelMedium" style={{ color: COLORS.onSurfaceVariant }}>
              Sukupuoli
            </Text>
            <Text variant="bodyLarge">{pet.sex || 'Ei tiedossa'}</Text>
          </View>

          {/* Age field */}
          <View style={{ marginBottom: SPACING.md }}>
            <Text variant="labelMedium" style={{ color: COLORS.onSurfaceVariant }}>
              Ikä
            </Text>
            <Text variant="bodyLarge">
              {calculateAge(pet.birthdate)} vuotta
            </Text>
          </View>

          {/*birthday*/}
          <View style={{ marginBottom: SPACING.md }}>
            <Text variant="labelMedium" style={{ color: COLORS.onSurfaceVariant }}>
              Syntynyt
            </Text>
            <Text variant="bodyLarge">
              {formatDate(new Date(pet.birthdate))}
            </Text>
          </View>

          {/* Notes*/}
          {pet.notes && (
            <View>
              <Text variant="labelMedium" style={{ color: COLORS.onSurfaceVariant }}>
                Muistiinpanot
              </Text>
              <Text variant="bodyLarge">{pet.notes}</Text>
            </View>
            )}
        </Card.Content>
      </Card>

      {/* ACTION BUTTONS*/}
      <View style={{ padding: SPACING.lg, gap: SPACING.sm }}>
        {/* Edit button*/}
        <Button 
          mode="outlined" 
          onPress={handleEditPet}
          icon="pencil"
        >
          Muokkaa lemmikin tietoja
        </Button>

        {/* Vaccinations*/}
        <Button 
          mode="contained-tonal" 
          onPress={() => navigation.navigate('Vaccinations' as never)}
          icon="needle"
        >
          Rokotukset ({pet.id})
        </Button>

        {/* Medications*/}
        <Button 
          mode="contained-tonal" 
          onPress={() => navigation.navigate('Medications' as never)}
          icon="pill"
        >
          Lääkitys
        </Button>

        {/* Weight*/}
        <Button 
          mode="contained-tonal" 
          onPress={() => navigation.navigate('WeightManagement' as never)}
          icon="scale"
        >
          Paino
        </Button>

        {/* Delete button*/}
        <Button 
          mode="outlined" 
          textColor={COLORS.error}
          onPress={handleDeletePet}
          disabled={isDeleting} // Disable if delete is already in progress
          icon="delete"
        >
          Poista lemmikki
        </Button>
      </View>

      {/* EDIT (Modal popup)*/}
      {/* Portal --> dialog will open up above rest of the stuff*/}
      <Portal>
        <Dialog 
          visible={editDialogVisible} // Show/hide based on state
          onDismiss={() => setEditDialogVisible(false)} // Close when tapping outside
        >
          <Dialog.Title>Muokkaa lemmikin tietoja</Dialog.Title>
          <Dialog.Content>
            
            {/* Pet name field */}
            <TextInput
              label="Nimi"
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
            />
            {/* Pet type field */}
            <TextInput
              label="Laji (esim. Koira, Kissa)"
              value={editType}
              onChangeText={setEditType}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              placeholder="Koira, Kissa, jne."
            />
            
            {/* Pet breed field */}
            <TextInput
              label="Rotu"
              value={editBreed}
              onChangeText={setEditBreed}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
            />

            {/* Pet sex field */}
            <TextInput
              label="Sukupuoli (Uros/Naaras)"
              value={editSex}
              onChangeText={setEditSex}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              placeholder="Uros tai Naaras"
            />

            <TextInput
              label="Syntymäpäivä (VVVV-KK-PP)"
              value={editBirthdate}
              onChangeText={setEditBirthdate} // Update state as user types
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              placeholder="2020-03-15"
            />

            {/* Pet notes field*/}
            <TextInput
              label="Muistiinpanot (valinnainen)"
              value={editNotes}
              onChangeText={setEditNotes}
              mode="outlined"
              multiline={true} // Allow multiple lines for notes
              numberOfLines={4} // Show 4 lines initially
              placeholder="Lisää muistiinpanoja lemmikistä..."
            />
          </Dialog.Content>
          
          {/* Dialog action buttons */}
          <Dialog.Actions>
            
            {/* Cancel button */}
            <Button 
              onPress={() => setEditDialogVisible(false)} 
              disabled={isSaving} // Disable while saving
            >
              Peruuta
            </Button>
            
            {/* Save button - Call handleSavePet --> save changes --> changes to API */}
            <Button 
              onPress={handleSavePet} 
              loading={isSaving} // Show loading spinner while saving
              disabled={isSaving} // Disable while saving to prevent double-clicks
            >
              Tallenna
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}