import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import styles from './HomeScreen.styles';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>
          Tervetuloa MyPetiin! 🐾
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Hallinnoi lemmikkejäsi helposti ja kätevällä tavalla
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Omat lemmikki</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Lisää ja hallinnoi kaikki lemmikkejäsi yhdessä paikassa
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained">Selaa</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Terveydentila</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Seuraa lemmikkien terveydentilaa ja rokotuksia
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained">Näytä</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">Aktiviteetit</Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Kirjaa lemmikkien päivittäisiä aktiviteetteja
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained">Lisää</Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
}
