import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@contexts/AuthContext';
import { SnackbarProvider } from '@contexts/SnackbarContext';
import Navigation from '@navigation/Navigation';
import MD3Theme from './styles/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={MD3Theme}>
          <SnackbarProvider>
            <AuthProvider>
              <Navigation />
            </AuthProvider>
          </SnackbarProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
