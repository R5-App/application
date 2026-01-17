// Snackbar Context for global notifications
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType, duration?: number) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const [duration, setDuration] = useState(3000);

  const showSnackbar = (msg: string, snackbarType: SnackbarType = 'info', dur: number = 3000) => {
    setMessage(msg);
    setType(snackbarType);
    setDuration(dur);
    setVisible(true);
  };

  const hideSnackbar = () => {
    setVisible(false);
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50'; // vihreä
      case 'error':
      case 'warning':
        return '#f44336'; // punainen
      case 'info':
        return '#2196f3'; // sininen
      default:
        return '#323232'; // oletus
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={duration}
        action={{
          label: 'Sulje',
          onPress: hideSnackbar,
          textColor: '#ffffff',
        }}
        style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 0,
  },
});

export default SnackbarContext;
