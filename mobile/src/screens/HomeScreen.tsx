import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { homeStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const firstName = user?.username?.split(' ')[0] || user?.username || 'Käyttäjä';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>
          Hei, {firstName}!
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card} onPress={() => navigation.navigate('Pets' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="paw" size={64} color={COLORS.primary} />
            <Text variant="titleMedium" style={{ marginTop: SPACING.md }}>Lemmikit</Text>

          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Profile' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="account" size={64} color={COLORS.primary} />
            <Text variant="titleMedium" style={{ marginTop: SPACING.md }}>Profiili</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Calendar' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar" size={64} color={COLORS.primary} />
            <Text variant="titleMedium" style={{ marginTop: SPACING.md }}>Kalenteri</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Health' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="medical-bag" size={64} color={COLORS.primary} />
            <Text variant="titleMedium" style={{ marginTop: SPACING.md }}>Terveys</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('WalkHistory' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="run" size={64} color={COLORS.primary} />
            <Text variant="titleMedium" style={{ marginTop: SPACING.md }}>Lenkit</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Maps' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="map" size={64} color={COLORS.primary} />
            <Text variant="titleMedium" style={{ marginTop: SPACING.md }}>Kartta</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Settings' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="cog" size={64} color={COLORS.primary} />
            <Text variant="titleMedium" style={{ marginTop: SPACING.md }}>Asetukset</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}
