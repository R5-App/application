import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, List, Switch, Button } from 'react-native-paper';
import { useAuth } from '@contexts/AuthContext';
import styles from './SettingsScreen.styles';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Käyttäjä
        </Text>
        <List.Item
          title={user?.name || user?.username || 'Käyttäjä'}
          description={user?.email}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Ilmoitukset
        </Text>
        <List.Item
          title="Ota käyttöön ilmoitukset"
          right={() => (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Näyttö
        </Text>
        <List.Item
          title="Pimeä tila"
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tietoa
        </Text>
        <List.Item
          title="Sovelluksen versio"
          description="1.0.0"
        />
        <List.Item
          title="Yhteydenotto"
          description="support@mypet.com"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" style={styles.button} onPress={handleLogout}>
          Kirjaudu ulos
        </Button>
      </View>
    </ScrollView>
  );
}
