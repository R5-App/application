import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from '@navigation/Navigation';

const theme = MD3LightTheme;

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <Navigation />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
