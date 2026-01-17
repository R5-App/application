import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { homeStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const paw1 = useRef(new Animated.Value(0)).current;
  const paw2 = useRef(new Animated.Value(0)).current;
  const paw3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animatePaws = () => {
      Animated.sequence([
        Animated.timing(paw1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(paw2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(paw3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(paw1, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(paw2, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(paw3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animatePaws());
    };
    animatePaws();
  }, []);

  const firstName = user?.username?.split(' ')[0] || user?.username || 'Käyttäjä';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.md }}>
          <Animated.Text style={{ fontSize: 32, opacity: paw1, transform: [{ scale: paw1 }] }}>🐾</Animated.Text>
          <Animated.Text style={{ fontSize: 32, opacity: paw2, transform: [{ scale: paw2 }], marginHorizontal: SPACING.sm }}>🐾</Animated.Text>
          <Animated.Text style={{ fontSize: 32, opacity: paw3, transform: [{ scale: paw3 }] }}>🐾</Animated.Text>
        </View>
        <Text variant="displaySmall" style={styles.title}>
          Hei, {firstName}!
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Hallinnoi lemmikkejäsi helposti
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card} onPress={() => console.log('Lemmikki')}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="paw" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Lemmikki</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Hallinnoi lemmikkejäsi
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => console.log('Profiili')}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="account" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Profiili</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Omat tiedot ja asetukset
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => console.log('Kalenteri')}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="calendar" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Kalenteri</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Tapahtumat ja muistutukset
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => console.log('Terveys')}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="medical-bag" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Terveys</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Rokotukset ja lääkitys
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => console.log('Sijainti')}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="map-marker" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Sijainti</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Eläinlääkärit ja palvelut
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => console.log('Asetukset')}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="cog" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Asetukset</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Sovelluksen asetukset
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}
