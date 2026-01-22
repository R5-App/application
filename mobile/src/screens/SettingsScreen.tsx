import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, List, Switch, Button, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '@contexts/AuthContext';
import { settingsStyles as styles } from '../styles/screenStyles';
import { COLORS } from '../styles/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = React.useState(false);

  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogVisible(false);
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

      <Portal>
        <Dialog 
          visible={logoutDialogVisible} 
          onDismiss={() => setLogoutDialogVisible(false)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        >
          <Dialog.Title>Kirjaudu ulos</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Haluatko varmasti kirjautua ulos?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>
              Peruuta
            </Button>
            <Button 
              onPress={handleConfirmLogout}
              textColor={COLORS.error}
            >
              Kirjaudu ulos
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
