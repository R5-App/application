import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, FAB, Portal, Button, Dialog } from 'react-native-paper';
import { petsStyles as styles } from '../styles/screenStyles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import petService from '../services/petService';
import { Pet } from '../types';

const SCREEN_NAME = 'PetsScreen';

export default function PetsScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPetInfoDialog, setShowAddPetInfoDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserPets();
    }, [])
  );


  const fetchUserPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await petService.getUserPets();
      
      if (result.success && result.data) {
        setPets(result.data);
      } else {
        setError(result.message || 'Lemmikkien lataus epäonnistui');
      }
    } catch (error) {
      setError('Lemmikkien lataus epäonnistui');
      console.error('Error fetching pets:', error);
    } finally {
      // Whether success or error, mark loading as complete
      setLoading(false);
    }
  };

  // NAVIGATE TO PET PROFILE 
  const handlePetPress = (petId: string) => {
    (navigation.navigate as any)('PetProfile', {petId});
  };

  // NAVIGATE TO ADD PET SCREEN
const handleAddPet = () => {
  console.log(`[${SCREEN_NAME}] Navigating to AddPet`);
  navigation.navigate('AddPet' as never);
};

  const handleCloseAddPetDialog = () => {
    setShowAddPetInfoDialog(false);
  }

  // EMPTY STATE
  // Show when user has no pets yet
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall">Ei lemmikkejä</Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Lisää ensimmäinen lemmikki aloittaaksesi
      </Text>
    </View>
  );

  // LOADING STATE
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text>Ladataan lemmikkejä...</Text>
        </View>
      </View>
    );
  }

  //  MAIN RENDER 
  return (
    <View style={styles.container}>
      {/* Show empty state if user has no pets, otherwise show list */}
      {pets.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={pets}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => handlePetPress(item.id)}
            >
              <Card.Content>
                
                {/* PLACEHOLDER PET IMAGE */}
                <View style={styles.petImagePlaceholder}>
                  <Text variant="bodyMedium" style={ styles.petImagePlaceholderText}>
                    🐾 Kuva
                  </Text>
                </View>

                {/* PET NAME */}
                <Text variant="titleLarge" style={styles.petName}>
                  {item.name}
                </Text>

              </Card.Content>
            </Card>
          )}

          keyExtractor={(item) => item.id.toString()} // Use pet ID as unique key for each item in list
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Button to add a new pet */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddPet}
      />

      <Portal>
        <Dialog
          visible={showAddPetInfoDialog}
          onDismiss={handleCloseAddPetDialog}
        >
          <Dialog.Title>Lisää lemmikki</Dialog.Title>
          
          <Dialog.Content>
            <Text variant="bodyMedium">
              AddPet screen tullaan pian. Voit lisätä lemmikin myöhemmin.
            </Text>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={handleCloseAddPetDialog}>
              Ok
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}