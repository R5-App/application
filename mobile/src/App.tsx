import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { SnackbarProvider } from '@contexts/SnackbarContext';
import { WalkProvider, useWalk } from '@contexts/WalkContext';
import Navigation from '@navigation/Navigation';
import MD3Theme from './styles/theme';
import SyncSetupDialog from '@components/SyncSetupDialog';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { settings, updateSettings } = useWalk();
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  useEffect(() => {
    // Show sync dialog on first login
    if (isAuthenticated && !isLoading && !settings.syncedOnce) {
      setShowSyncDialog(true);
    }
  }, [isAuthenticated, isLoading, settings.syncedOnce]);

  const handleEnableSync = async () => {
    console.log('Enabling sync, current settings:', settings);
    const newSettings = {
      ...settings,
      enableSync: true,
      syncedOnce: true,
    };
    console.log('Saving new settings:', newSettings);
    await updateSettings(newSettings);
    console.log('Settings saved, closing dialog');
    setShowSyncDialog(false);
  };

  const handleDisableSync = async () => {
    console.log('Disabling sync, current settings:', settings);
    const newSettings = {
      ...settings,
      enableSync: false,
      syncedOnce: true,
    };
    console.log('Saving new settings:', newSettings);
    await updateSettings(newSettings);
    console.log('Settings saved, closing dialog');
    setShowSyncDialog(false);
  };

  return (
    <>
      <Navigation />
      <SyncSetupDialog
        visible={showSyncDialog}
        onEnableSync={handleEnableSync}
        onDisableSync={handleDisableSync}
      />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={MD3Theme}>
          <SnackbarProvider>
            <AuthProvider>
              <WalkProvider>
                <AppContent />
              </WalkProvider>
            </AuthProvider>
          </SnackbarProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
