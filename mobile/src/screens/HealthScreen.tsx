import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { homeStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';

export default function HealthScreen() {
  const navigation = useNavigation();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animatePulse = () => {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.delay(500),
      ]).start(() => animatePulse());
    };
    animatePulse();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.md }}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <MaterialCommunityIcons name="heart-pulse" size={48} color={COLORS.primary} />
          </Animated.View>
        </View>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Pidä huolta lemmikin terveydestä
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card} onPress={() => navigation.navigate('Visits' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="hospital-building" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Käynnit</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Eläinlääkäri- ja klinikkakäynnit
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Medications' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="pill" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Lääkitykset</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Lääkkeet ja hoito-ohjelmat
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Vaccinations' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="needle" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Rokotukset</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Rokotushistoria ja muistutukset
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('WeightManagement' as never)}>
          <Card.Content style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="scale-bathroom" size={64} color={COLORS.primary} />
            <Text variant="titleLarge" style={{ marginTop: SPACING.md }}>Painonhallinta</Text>
            <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
              Seuraa painoa ja kasvua
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}
