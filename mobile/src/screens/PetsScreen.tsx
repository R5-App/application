import React from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { Text, Card, Button, FAB } from 'react-native-paper';
import { useStyles } from './PetsScreen.styles';

export default function PetsScreen() {
  const styles = useStyles();
  const [pets, setPets] = React.useState([]);

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
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Lisää lemmikki')}
      />
    </View>
  );
}
