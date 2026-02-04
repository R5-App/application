import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Chip, ActivityIndicator, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { calendarStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { Pet } from '../types';

export default function CalendarScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets from the API
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const petsResponse = await apiClient.get('/api/pets');
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch pets:', err);
        setError('Tietojen lataus epäonnistui. Yritä uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="calendar-blank-outline" size={64} color={COLORS.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        Ei tapahtumia
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Kalenteritoiminnot tulossa pian
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
        {renderEmptyState()}
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Lisää tapahtuma')}
        label="Lisää Tapahtuma"
      />
    </View>
  );
}
