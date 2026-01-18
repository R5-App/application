import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Avatar, List, Divider, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthContext';
import { profileStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';

export default function ProfileScreen() {
  const { user } = useAuth();

  // Get initials for avatar
  const getInitials = (name?: string, username?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Ei tietoa';
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Text
          size={100}
          label={getInitials(user?.name, user?.username)}
          style={styles.avatar}
        />
        <Text variant="headlineMedium" style={styles.name}>
          {user?.name || user?.username || 'Käyttäjä'}
        </Text>
        {user?.role && (
          <Text variant="bodyMedium" style={styles.role}>
            {user.role === 'admin' ? 'Järjestelmänvalvoja' : 'Jäsen'}
          </Text>
        )}
      </View>

      {/* User Information Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Käyttäjätiedot
        </Text>
        <Card style={styles.card}>
          <List.Item
            title="Käyttäjänimi"
            description={user?.username || 'Ei asetettu'}
            left={() => (
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={COLORS.primary}
                style={{ marginLeft: SPACING.md }}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Sähköposti"
            description={user?.email || 'Ei asetettu'}
            left={() => (
              <MaterialCommunityIcons
                name="email"
                size={24}
                color={COLORS.primary}
                style={{ marginLeft: SPACING.md }}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Nimi"
            description={user?.name || 'Ei asetettu'}
            left={() => (
              <MaterialCommunityIcons
                name="account-circle"
                size={24}
                color={COLORS.primary}
                style={{ marginLeft: SPACING.md }}
              />
            )}
          />
        </Card>
      </View>

      {/* Account Information Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tilin tiedot
        </Text>
        <Card style={styles.card}>
          <List.Item
            title="Käyttäjätunnus"
            description={user?.id || 'Ei tietoa'}
            left={() => (
              <MaterialCommunityIcons
                name="identifier"
                size={24}
                color={COLORS.primary}
                style={{ marginLeft: SPACING.md }}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Tilin luotu"
            description={formatDate(user?.createdAt)}
            left={() => (
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={COLORS.primary}
                style={{ marginLeft: SPACING.md }}
              />
            )}
          />
        </Card>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tilastot
        </Text>
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="paw" size={32} color={COLORS.primary} />
              {/* TODO: Implement actual pets count from user data */}
              <Text variant="headlineSmall" style={styles.statNumber}>
                0
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Lemmikkiä
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <MaterialCommunityIcons name="calendar-check" size={32} color={COLORS.primary} />
              {/* TODO: Implement actual events count from user data */}
              <Text variant="headlineSmall" style={styles.statNumber}>
                0
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Tapahtumaa
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
