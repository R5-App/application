import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../styles/theme';

interface SyncSetupDialogProps {
  visible: boolean;
  onEnableSync: () => void;
  onDisableSync: () => void;
}

export default function SyncSetupDialog({ visible, onEnableSync, onDisableSync }: SyncSetupDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} dismissable={false} style={styles.dialog}>
        <Dialog.Title style={styles.title}>Synkronointi</Dialog.Title>
        <Dialog.Content>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="cloud-sync" size={48} color={COLORS.primary} />
          </View>
          
          <Paragraph style={styles.paragraph}>
            Haluatko synkronoida lenkkitietosi pilveen?
          </Paragraph>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Tiedot tallennetaan turvallisesti</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Käytä useilla laitteilla</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Älä koskaan menetä tietojasi</Text>
            </View>
          </View>

          <Paragraph style={styles.note}>
            Voit muuttaa tätä asetusta myöhemmin asetuksista.
          </Paragraph>
        </Dialog.Content>
        
        <Dialog.Actions style={styles.actions}>
          <Button 
            mode="text" 
            onPress={onDisableSync}
            textColor={COLORS.onSurfaceVariant}
          >
            Ei kiitos
          </Button>
          <Button 
            mode="contained" 
            onPress={onEnableSync}
            buttonColor={COLORS.primary}
          >
            Kyllä, synkronoi
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: SPACING.md,
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  paragraph: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.onSurface,
  },
  benefitsList: {
    marginVertical: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  benefitText: {
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  note: {
    fontSize: 11,
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  actions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
});
