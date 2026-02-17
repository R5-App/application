import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, FAB, Portal, Button, Dialog, IconButton } from 'react-native-paper';
import { petsStyles as styles } from '../styles/screenStyles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import petService from '../services/petService';
import { Pet } from '../types';
import SharePetDialog from '../components/SharePetDialog';
import RedeemShareCodeDialog from '../components/RedeemShareCodeDialog';
import { useAuth } from '../contexts/AuthContext';

const SCREEN_NAME = 'PetsScreen';

export default function PetsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPetInfoDialog, setShowAddPetInfoDialog] = useState(false);
  const [showAddOptionsDialog, setShowAddOptionsDialog] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogVisible, setShareDialogVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

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
      
      if (result.success && result.pets) {
        // Convert PetResponse[] to Pet[] with string IDs
        const convertedPets: Pet[] = result.pets.map(pet => ({
          id: String(pet.id),
          owner_id: pet.owner_id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          sex: pet.sex,
          birthdate: pet.birthdate,
          notes: pet.notes,
          role: pet.role || 'omistaja' // Default to owner if not specified
        }));
        setPets(convertedPets);
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
  console.log(`[${SCREEN_NAME}] Opening add pet options`);
  setShowAddOptionsDialog(true);
};

const handleAddNewPet = () => {
  setShowAddOptionsDialog(false);
  console.log(`[${SCREEN_NAME}] Navigating to AddPet`);
  navigation.navigate('AddPet' as never);
};

const handleRedeemCode = () => {
  setShowAddOptionsDialog(false);
  setShowRedeemDialog(true);
};

const handleRedeemSuccess = () => {
  fetchUserPets(); // Refresh pets list
};

  const handleCloseAddPetDialog = () => {
    setShowAddPetInfoDialog(false);
  }

  const handleSharePet = (pet: Pet) => {
    setSelectedPet(pet);
    setShareDialogVisible(true);
  };

  const handleCloseShareDialog = () => {
    setShareDialogVisible(false);
    setSelectedPet(null);
  };

  const isPetOwner = (pet: Pet) => {
    return user?.id === pet.owner_id;
  };

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

  // ERROR STATE
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall">Virhe</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {error}
          </Text>
          <Button mode="contained" onPress={fetchUserPets} style={{ marginTop: 16 }}>
            Yritä uudelleen
          </Button>
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

                {/* PET NAME AND SHARE ICON */}
                <View style={styles.petNameRow}>
                  <Text variant="titleLarge" style={styles.petName}>
                    {item.name}
                  </Text>
                  {isPetOwner(item) && (
                    <IconButton
                      icon="share-variant"
                      size={20}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSharePet(item);
                      }}
                    />
                  )}
                </View>

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
        {/* Add Options Dialog */}
        <Dialog
          visible={showAddOptionsDialog}
          onDismiss={() => setShowAddOptionsDialog(false)}
        >
          <Dialog.Title>Lisää lemmikki</Dialog.Title>
          
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
              Valitse miten haluat lisätä lemmikin:
            </Text>
            
            <Button
              mode="contained"
              icon="plus"
              onPress={handleAddNewPet}
              style={{ marginBottom: 12 }}
            >
              Luo uusi lemmikki
            </Button>
            
            <Button
              mode="outlined"
              icon="ticket"
              onPress={handleRedeemCode}
            >
              Lunasta jakokoodi
            </Button>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setShowAddOptionsDialog(false)}>
              Peruuta
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Old info dialog (can be removed) */}
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

      {/* Redeem Share Code Dialog */}
      <RedeemShareCodeDialog
        visible={showRedeemDialog}
        onDismiss={() => setShowRedeemDialog(false)}
        onSuccess={handleRedeemSuccess}
      />

      {/* Share Pet Dialog */}
      {selectedPet && (
        <SharePetDialog
          visible={shareDialogVisible}
          onDismiss={handleCloseShareDialog}
          petId={selectedPet.id}
          petName={selectedPet.name}
          isOwner={isPetOwner(selectedPet)}
        />
      )}
    </View>
  );
}