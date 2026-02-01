import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, Image } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';
import { petsStyles } from '../styles/screenStyles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import apiClient from '../services/api';
import { Pet } from '../types';
import { RootStackParamList } from '../navigation/Navigation';

export default function PetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const styles = petsStyles;
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserPets();
    }, [])
  );


  const fetchUserPets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/pets');
      if (response.data.success) {
        setPets(response.data.data);
      }
    } catch (error) {
      Alert.alert('Virhe', 'Lemmikien lataus epäonnistui');
      console.error('Error fetching pets:', error);
    } finally {
      // Whether success or error, mark loading as complete
      setLoading(false);
    }
  };

  // NAVIGATE TO PET PROFILE 
  const handlePetPress = (petId: string) => {
    navigation.navigate('PetProfile', {petId});
  };

  // NAVIGATE TO ADD PET SCREEN
  const handleAddPet = () => {
    Alert.alert('Info', 'AddPet screen coming soon');
    //navigation.navigate('AddPet', {});
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
                <View style={{ 
                  width: '100%', 
                  height: 150, 
                  backgroundColor: '#E0E0E0',
                  borderRadius: 8,
                  marginBottom: 12,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text variant="bodyMedium" style={{ color: '#999' }}>
                    🐾 Kuva
                  </Text>
                </View>

                {/* PET NAME */}
                <Text variant="titleLarge" style={{ marginBottom: 8 }}>
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
    </View>
  );
}




  /*
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall">Ei lemmikkejä</Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Lisää ensimmäinen lemmikki aloittaaksesi
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {pets.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={pets}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">{item.name}</Text>
                <Text variant="bodyMedium">{item.breed}</Text>
              </Card.Content>
            </Card>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}
*/