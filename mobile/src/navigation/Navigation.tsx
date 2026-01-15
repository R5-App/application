import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '@screens/HomeScreen';
import PetsScreen from '@screens/PetsScreen';
import SettingsScreen from '@screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'PetsTab') {
            iconName = 'paw';
          } else if (route.name === 'SettingsTab') {
            iconName = 'cog';
          } else {
            iconName = 'help';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#999999',
        headerShown: true,
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
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
