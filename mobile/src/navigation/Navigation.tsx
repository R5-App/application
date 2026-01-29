import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthContext';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { COLORS, SPACING, LAYOUT } from '../styles/theme';
import HomeScreen from '@screens/HomeScreen';
import PetsScreen from '@screens/PetsScreen';
import SettingsScreen from '@screens/SettingsScreen';
import ProfileScreen from '@screens/ProfileScreen';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import MapScreen from '@screens/MapScreen';
import WalkHistoryScreen from '@screens/WalkHistoryScreen';
import WalkDetailScreen from '@screens/WalkDetailScreen';
import HealthScreen from '@screens/HealthScreen';
import VisitsScreen from '@screens/VisitsScreen';
import MedicationsScreen from '@screens/MedicationsScreen';
import VaccinationsScreen from '../screens/VaccinationsScreen';
import WeightManagementScreen from '../screens/WeightManagementScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoadingScreen() {
  const paw1 = useRef(new Animated.Value(-50)).current;
  const paw2 = useRef(new Animated.Value(-50)).current;
  const paw3 = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const animatePaw = (animValue: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 400,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: -50,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animatePaw(paw1, 0);
    animatePaw(paw2, 400);
    animatePaw(paw3, 800);
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ translateX: paw1 }] }}>
        <MaterialCommunityIcons name="paw" size={LAYOUT.iconXl} color={COLORS.primary} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: paw2 }] }}>
        <MaterialCommunityIcons name="paw" size={LAYOUT.iconXl} color={COLORS.primary} />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX: paw3 }] }}>
        <MaterialCommunityIcons name="paw" size={LAYOUT.iconXl} color={COLORS.primary} />
      </Animated.View>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';


          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'PetsTab') {
            iconName = 'paw';
          } else if (route.name === 'MapTab') {
            iconName = 'map-marker-path';
          } else if (route.name === 'SettingsTab') {
            iconName = 'cog';
          } else {
            iconName = 'help';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: route.name === 'MapTab' ? {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.35)',
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
        } : {
          backgroundColor: COLORS.surface,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Koti',
          tabBarLabel: 'Koti',
        }}
      />
      <Tab.Screen
        name="PetsTab"
        component={PetsScreen}
        options={{
          title: 'Lemmikki',
          tabBarLabel: 'Lemmikki',
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          title: 'Kartta',
          tabBarLabel: 'Kartta',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Asetukset',
          tabBarLabel: 'Asetukset',
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="HomeTabs"
              component={HomeTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WalkHistory"
              component={WalkHistoryScreen}
              options={{
                title: 'Lenkkihistoria',
                headerBackTitle: 'Takaisin',
              }}
            />
            <Stack.Screen
              name="WalkDetail"
              component={WalkDetailScreen}
              options={{
                title: 'Lenkin reitti',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'Profiili',
                headerBackTitle: 'Takaisin',
              }}
            />
            <Stack.Screen
              name="Health"
              component={HealthScreen}
              options={{
                title: 'Terveys',
                headerBackTitle: 'Takaisin',
              }}
            />
            <Stack.Screen
              name="Visits"
              component={VisitsScreen}
              options={{
                title: 'Käynnit',
                headerBackTitle: 'Takaisin',
              }}
            />
            <Stack.Screen
              name="Medications"
              component={MedicationsScreen}
              options={{
                title: 'Lääkitykset',
                headerBackTitle: 'Takaisin',
              }}
            />
            <Stack.Screen
              name="Vaccinations"
              component={VaccinationsScreen}
              options={{
                title: 'Rokotukset',
                headerBackTitle: 'Takaisin',
              }}
            />
            <Stack.Screen
              name="WeightManagement"
              component={WeightManagementScreen}
              options={{
                title: 'Painonhallinta',
                headerBackTitle: 'Takaisin',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Asetukset',
                headerBackTitle: 'Takaisin',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: 'Rekisteröidy',
                headerBackTitle: 'Takaisin',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    paddingLeft: SPACING.lg,
    gap: SPACING.md,
  },
});