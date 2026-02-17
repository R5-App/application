import React, { useState } from 'react';
import { View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Dialog, Portal, Button, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { petsStyles as styles } from '../styles/screenStyles';
import { COLORS } from '../styles/theme';
import petService from '../services/petService';
import { useSnackbar } from '../contexts/SnackbarContext';

interface RedeemShareCodeDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export default function RedeemShareCodeDialog({ visible, onDismiss, onSuccess }: RedeemShareCodeDialogProps) {
  const { showSnackbar } = useSnackbar();
  const [shareCode, setShareCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!shareCode.trim()) {
      showSnackbar('Syötä jakokoodi', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await petService.redeemShareCode(shareCode);
      if (result.success && result.data) {
        showSnackbar(`Onnistui! Sait pääsyn lemmikkiin: ${result.data.name}`, 'success');
        setShareCode('');
        onSuccess();
        onDismiss();
      } else {
        showSnackbar(result.message || 'Lunastus epäonnistui', 'error');
      }
    } catch (error) {
      showSnackbar('Lunastus epäonnistui', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setShareCode('');
    onDismiss();
  };

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Title>Lunasta jakokoodi</Dialog.Title>
        
        <Dialog.Content style={styles.dialogContent}>
          <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
            <View>
              <Text variant="bodyMedium" style={{ marginBottom: 16, color: COLORS.onSurface }}>
                Syötä lemmikin jakokoodi jonka sait omistajalta.
              </Text>

              <TextInput
                label="Jakokoodi"
                value={shareCode}
                onChangeText={setShareCode}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Liitä jakokoodi tähän..."
                disabled={loading}
                style={styles.editInput}
                onSubmitEditing={handleRedeem}
                blurOnSubmit={true}
              />

              {loading && (
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleClose} disabled={loading}>
            Peruuta
          </Button>
          <Button 
            onPress={() => {
              Keyboard.dismiss();
              handleRedeem();
            }} 
            disabled={loading || !shareCode.trim()}
            mode="contained"
          >
            Lunasta
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
