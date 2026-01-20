import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { profileStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleChangeEmail = () => {
    Alert.alert('Muuta sähköposti', 'Tämä toiminto tulossa pian');
  };

  const handleChangePassword = () => {
    Alert.alert('Muuta salasana', 'Tämä toiminto tulossa pian');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Poista tili',
      'Haluatko varmasti poistaa tilisi? Tätä toimintoa ei voi peruuttaa.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            console.log('Delete account');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Kirjaudu ulos', 'Haluatko varmasti kirjautua ulos?', [
      { text: 'Peruuta', style: 'cancel' },
      {
        text: 'Kirjaudu ulos',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  // Format date to Finnish format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Ei tiedossa';
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI');
  };

  // Get last seen date (mock data for now)
  const getLastSeen = () => {
    return new Date().toLocaleDateString('fi-FI');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={100} color={COLORS.primary} />
        <Text variant="headlineMedium" style={styles.title}>
          {user?.name || user?.username}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Nimimerkki:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {user?.username}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Sähköposti:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {user?.email}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Tili luotu:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {formatDate(user?.createdAt)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Viimeksi paikalla:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {getLastSeen()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="text"
            onPress={handleChangeEmail}
            icon="email-edit"
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            style={styles.actionButton}
          >
            Muuta sähköposti
          </Button>

          <Button
            mode="text"
            onPress={handleChangePassword}
            icon="lock-reset"
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            style={styles.actionButton}
          >
            Muuta salasanaa
          </Button>

          <Button
            mode="text"
            onPress={handleDeleteAccount}
            icon="delete"
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: COLORS.error }]}
            style={styles.actionButton}
            textColor={COLORS.error}
          >
            Poista tili
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Sovelluksen asetukset
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Lisää asetuksia tulossa pian...
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          icon="logout"
          buttonColor={COLORS.error}
          style={styles.logoutButton}
        >
          Kirjaudu ulos
        </Button>
      </View>
    </ScrollView>
  );
}
