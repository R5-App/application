import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import petService from '../services/petService';
import { Pet } from '../types';
import { COLORS, LAYOUT } from '../styles/theme';
import { calculateAge, formatDate, validatePetData } from '../helpers';
import { petsStyles as styles } from '../styles/screenStyles';

export default function PetDetailsScreen() {
  const route = useRoute(); // access to route params
  const navigation = useNavigation();
  const { petId } = route.params as { petId: string };  // Extract the petId from route params

  const [pet, setPet] = useState<Pet | null>(null);  // Storing pet object that we got from API (null until loaded)
  const [loading, setLoading] = useState(true);   // Tracks whether data is still being fetched from the API
  const [editDialogVisible, setEditDialogVisible] = useState(false); // modal popip visibility
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  // For editing pet name, breed,age etc:
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editSex, setEditSex] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const [isSaving, setIsSaving] = useState(false); // track saving (prevent double clicks)
  const [isDeleting, setIsDeleting] = useState(false); // same as above but for deleting
  const [validationDialogVisible, setValidationDialogVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const [messageDialogVisible, setMessageDialogVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchPetDetails();
    setError(null);
  }, []);


  // Fetch pet data
  const fetchPetDetails = async () => {
    try {
      const result = await petService.getPetById(petId);
      
      if (result.success && result.data) {
        setPet(result.data); // store pet data in state
      } else {
        setError(result.message || 'Lemmikin tietojen lataus epäonnistui');
      }
    } catch (error) {
      setError('Virhe. Lemmikin tietojen lataus epäonnistui');
      console.error('Error fetching pet details:', error);
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
    const validation = validatePetData(editName, editType, editBreed, editSex, editBirthdate);
    
    if (!validation.valid) {
      setValidationMessage(validation.message || '');
      setValidationDialogVisible(true);
      return;
    }
   // ennen kuin const validation jne lisättiin, tässä oli:
   // if (!editName || !editBreed || !editType || !editSex) {  // Validate that required fields are filled in
   //   setValidationMessage('Täytä kaikki pakolliset kentät');
   //   setValidationDialogVisible(true);
   //   return; // Exit early if validation fails
   // }
   // Validate birthdate format (should be YYYY-MM-DD)
   // if (!/^\d{4}-\d{2}-\d{2}$/.test(editBirthdate)) {
   //   setValidationMessage('Syntymäpäivä pitää olla muodossa VVVV-KK-PP');
   //   setValidationDialogVisible(true);
   //   return;
   // }
    setIsSaving(true); // Mark save operation as in progress (to disable buttons and show loading)
    
    // Send updated pet data to API (PUT request)
    try {
      const result = await petService.updatePet(petId, {
        name: editName,
        type: editType,
        breed: editBreed,
        sex: editSex,
        birthdate: editBirthdate,
        notes: editNotes,
      });

      if (result.success && result.data) { // Check if API response indicates success
        setPet(result.data); // Update the displayed pet data with the new values from API
        setEditDialogVisible(false); // Close the edit dialog

        setMessageTitle('Onnistui');
        setMessageContent('Lemmikin tiedot päivitetty');
        setMessageType('success');
        setMessageDialogVisible(true);
      } else {
        setMessageTitle('Virhe');
        setMessageContent(result.message || 'Päivitys epäonnistui');
        setMessageType('error');
        setMessageDialogVisible(true);
      }
    } catch (error) {
      setMessageTitle('Virhe');
      setMessageContent('Päivitys epäonnistui');
      setMessageType('error');
      setMessageDialogVisible(true);
      console.error('Error updating pet:', error);
    } finally {
      setIsSaving(false);
    }
  };

// Deleting pet + confirmation
  const handleDeletePet = () => {
    setMessageTitle('Poista lemmikki');
    setMessageContent(`Haluatko varmasti poistaa lemmikin "${pet?.name}"?`);
    setMessageType('error');
    setMessageDialogVisible(true);
  };

  const confirmDeletePet = async () => {
    setMessageDialogVisible(false);
    setIsDeleting(true);
            
            try {
              const result = await petService.deletePet(petId); // Send DELETE request to API to remove the pet

              if (result.success) {
                  setMessageTitle('Onnistui');
                  setMessageContent('Lemmikki poistettu');
                  setMessageType('success');
                  setMessageDialogVisible(true);

                  // Navigate back after showing dialog
                  setTimeout(() => {
                    navigation.goBack?.();
                  }, 1000);
                } else {
                  setMessageTitle('Virhe');
                  setMessageContent(result.message || 'Poistaminen epäonnistui');
                  setMessageType('error');
                  setMessageDialogVisible(true);
                }
              } catch (error) {
                setMessageTitle('Virhe');
                setMessageContent('Poistaminen epäonnistui');
                setMessageType('error');
                setMessageDialogVisible(true);
                console.error('Error deleting pet:', error);
            } finally {
              setIsDeleting(false); // Mark delete operation as complete
            }
          };
          
// show while data is being fetched)
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Ladataan...</Text>
      </View>
    );
  }

// if pet data couldn't be found/loaded)
  if (!pet) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.loadingText}>Lemmikkiä ei löytynyt</Text>
        </View>
      </View>
    );
  }


// Show pet details when data is loaded successfully
  return (
    <ScrollView style={styles.container}>
      
      {/*HEADER*/}
      {/* Display pet icon and name at top with colored background */}
      <View style={styles.headerContainer}>
        
        {/* Paw icon */}
        <MaterialCommunityIcons 
          name="paw" 
          size={LAYOUT.iconXl} 
          color={COLORS.onPrimaryContainer}
          style={styles.headerIcon}
        />
        
        {/* headline (pet name) */}
        <Text 
          variant="headlineMedium" 
          style={styles.headerTitle}>
            {pet.name} 
        </Text>
      </View>

      {/*PET INFORMATION*/}
      <Card style={styles.infoCard}>
        <Card.Content>
                    
          {/*Type*/}
          <View style={styles.infoSection}>
            <Text variant="labelMedium" style={styles.infoLabel}>
              Lajityyppi
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>{pet.type || 'Ei tiedossa'}</Text>
          </View>
          
          {/*Breed*/}
          <View style={styles.infoSection}>
            <Text variant="labelMedium" style={styles.infoLabel}>
              Rotu
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>{pet.breed}</Text>
          </View>

          {/*Sex*/}
          <View style={styles.infoSection}>
            <Text variant="labelMedium" style={styles.infoLabel}>
              Sukupuoli
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>{pet.sex || 'Ei tiedossa'}</Text>
          </View>

          {/* Age field */}
          <View style={styles.infoSection}>
            <Text variant="labelMedium" style={styles.infoLabel}>
              Ikä
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {calculateAge(pet.birthdate)} vuotta
            </Text>
          </View>

          {/*birthday*/}
          <View style={styles.infoSection}>
            <Text variant="labelMedium" style={styles.infoLabel}>
              Syntynyt
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {formatDate(new Date(pet.birthdate))}
            </Text>
          </View>

          {/* Notes*/}
          {pet.notes && (
            <View style={styles.infoSection}>
              <Text variant="labelMedium" style={styles.infoLabel}>
                Muistiinpanot
              </Text>
              <Text variant="bodyLarge" style={styles.infoValue}>{pet.notes}</Text>
            </View>
            )}
        </Card.Content>
      </Card>

      {/* ACTION BUTTONS*/}
      <View style={styles.actionsContainer}>
        {/* Edit button*/}
        <Button 
          mode="outlined" 
          onPress={handleEditPet}
          icon="pencil"
          style={styles.actionButton}
        >
          Muokkaa lemmikin tietoja
        </Button>

        {/* Vaccinations*/}
        <Button 
          mode="contained-tonal" 
          onPress={() => navigation.navigate('Vaccinations' as never)}
          icon="needle"
          style={styles.actionButton}
          >
          Rokotukset
        </Button>

        {/* Medications*/}
        <Button 
          mode="contained-tonal" 
          onPress={() => navigation.navigate('Medications' as never)}
          icon="pill"
          style={styles.actionButton}
        >
          Lääkitys
        </Button>

        {/* Weight*/}
        <Button 
          mode="contained-tonal" 
          onPress={() => navigation.navigate('WeightManagement' as never)}
          icon="scale"
          style={styles.actionButton}
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
          style={styles.actionButton}
        >
          Poista lemmikki
        </Button>
      </View>

      {/* EDIT (Modal popup)*/}
      {/* Portal --> dialog will open up above rest of the stuff*/}
      <Portal>
        {/* Delete confirmation dialog */}
        <Dialog
          visible={messageDialogVisible && messageTitle === 'Poista lemmikki'}
          onDismiss={() => setMessageDialogVisible(false)}
        >
          <Dialog.Title style={{ color: COLORS.error }}>{messageTitle}</Dialog.Title>
          <Dialog.Content>
            <Text>{messageContent}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMessageDialogVisible(false)}>Peruuta</Button>
            <Button
              onPress={confirmDeletePet}
              disabled={isDeleting}
              textColor={COLORS.error}
            >
              {isDeleting ? 'Poistetaan...' : 'Poista'}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Generic message dialog for other messages (success/error) */}
        <Dialog
          visible={messageDialogVisible && messageTitle !== 'Poista lemmikki'}
          onDismiss={() => setMessageDialogVisible(false)}
        >
          <Dialog.Title style={{ color: messageType === 'error' ? COLORS.error : COLORS.primary }}>
            {messageTitle}
          </Dialog.Title>
          <Dialog.Content>
            <Text>{messageContent}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMessageDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Validation error dialog */}
        <Dialog
          visible={validationDialogVisible}
          onDismiss={() => setValidationDialogVisible(false)}
        >
          <Dialog.Title>Virhe</Dialog.Title>
          <Dialog.Content>
            <Text>{validationMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setValidationDialogVisible(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Edit dialog */}
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
              style={styles.editInput}
            />
            {/* Pet type field */}
            <TextInput
              label="Laji (esim. Koira, Kissa)"
              value={editType}
              onChangeText={setEditType}
              mode="outlined"
              style={styles.editInput}
              placeholder="Koira, Kissa, jne."
            />
            
            {/* Pet breed field */}
            <TextInput
              label="Rotu"
              value={editBreed}
              onChangeText={setEditBreed}
              mode="outlined"
              style={styles.editInput}
            />

            {/* Pet sex field */}
            <TextInput
              label="Sukupuoli (Uros/Naaras)"
              value={editSex}
              onChangeText={setEditSex}
              mode="outlined"
              style={styles.editInput}
              placeholder="Uros tai Naaras"
            />

            <TextInput
              label="Syntymäpäivä (VVVV-KK-PP)"
              value={editBirthdate}
              onChangeText={setEditBirthdate} // Update state as user types
              mode="outlined"
              style={styles.editInput}
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
              style={styles.editInput}
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