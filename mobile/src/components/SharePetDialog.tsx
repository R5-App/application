import React, { useState, useEffect } from 'react';
import { View, ScrollView, Clipboard } from 'react-native';
import { Dialog, Portal, Button, Text, IconButton, ActivityIndicator, Chip } from 'react-native-paper';
import { petsStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';
import petService from '../services/petService';
import authService from '../services/authService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useAuth } from '../contexts/AuthContext';

interface SharePetDialogProps {
  visible: boolean;
  onDismiss: () => void;
  petId: string;
  petName: string;
  isOwner: boolean;
}

interface SharedUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  shared_at: string;
}

export default function SharePetDialog({ visible, onDismiss, petId, petName, isOwner }: SharePetDialogProps) {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'manage'>('generate');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roleEditDialogVisible, setRoleEditDialogVisible] = useState(false);
  const [editingSharedUser, setEditingSharedUser] = useState<SharedUser | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    if (visible && isOwner && activeTab === 'manage') {
      loadSharedUsers();
    }
  }, [visible, activeTab, isOwner]);

  const loadSharedUsers = async () => {
    setLoadingUsers(true);
    try {
      const result = await petService.getSharedUsers(petId);
      if (result.success && result.data) {
        setSharedUsers(result.data);
      } else {
        showSnackbar(result.message || 'Jaettujen käyttäjien lataus epäonnistui', 'error');
      }
    } catch (error) {
      showSnackbar('Jaettujen käyttäjien lataus epäonnistui', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const result = await petService.sharePet(petId, '24h');
      if (result.success && result.data) {
        setShareCode(result.data.shareCode);
        showSnackbar('Jakokoodi luotu onnistuneesti', 'success');
      } else {
        showSnackbar(result.message || 'Jakokoodin luonti epäonnistui', 'error');
      }
    } catch (error) {
      showSnackbar('Jakokoodin luonti epäonnistui', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (shareCode) {
      Clipboard.setString(shareCode);
      showSnackbar('Jakokoodi kopioitu leikepöydälle', 'success');
    }
  };

  const handleRemoveUser = async (userId: string, username: string) => {
    if (!isOwner) return;

    try {
      const result = await petService.removeSharedUser(petId, userId);
      if (result.success) {
        showSnackbar(`Käyttäjä ${username} poistettu`, 'success');
        loadSharedUsers();
      } else {
        showSnackbar(result.message || 'Käyttäjän poisto epäonnistui', 'error');
      }
    } catch (error) {
      showSnackbar('Käyttäjän poisto epäonnistui', 'error');
    }
  };

  const handleEditSharedUserRole = (sharedUser: SharedUser) => {
    setEditingSharedUser(sharedUser);
    setRoleEditDialogVisible(true);
  };

  const handleUpdateRole = async (newRole: string) => {
    if (!isOwner || !editingSharedUser) return;

    setIsUpdatingRole(true);
    try {
      const result = await authService.updateSubUserRole(editingSharedUser.id, newRole);
      if (result.success) {
        showSnackbar(`Käyttäjän ${editingSharedUser.username} rooli päivitetty`, 'success');
        setRoleEditDialogVisible(false);
        loadSharedUsers();
      } else {
        showSnackbar(result.message || 'Roolin päivitys epäonnistui', 'error');
      }
    } catch (error) {
      showSnackbar('Roolin päivitys epäonnistui', 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleClose = () => {
    setShareCode(null);
    setActiveTab('generate');
    onDismiss();
  };

  const renderGenerateTab = () => (
    <View style={styles.shareSection}>
      {!shareCode ? (
        <>
          <Text style={styles.expiryText}>
            📌 Jakokoodi on voimassa 24 tuntia
          </Text>

          <Button
            mode="contained"
            onPress={handleGenerateCode}
            loading={loading}
            disabled={loading}
            icon="share-variant"
            style={{ marginTop: 16 }}
          >
            Luo jakokoodi
          </Button>
        </>
      ) : (
        <>
          <Text style={styles.shareSectionTitle}>Jakokoodi luotu!</Text>
          
          <Text style={styles.shareCodeText} selectable>
            {shareCode}
          </Text>

          <View style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={handleCopyCode}
              icon="content-copy"
              style={{ flex: 1 }}
            >
              Kopioi
            </Button>
          </View>

          <Text style={styles.expiryText}>
            ⏰ Koodi on voimassa 24 tuntia
          </Text>

          <Button
            mode="text"
            onPress={() => setShareCode(null)}
            style={{ marginTop: 16 }}
          >
            Luo uusi koodi
          </Button>
        </>
      )}
    </View>
  );

  const renderManageTab = () => (
    <View style={styles.shareSection}>
      <Text style={styles.shareSectionTitle}>
        Jaetut käyttäjät ({sharedUsers.length})
      </Text>

      {loadingUsers ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : sharedUsers.length === 0 ? (
        <Text style={styles.emptySharedUsers}>
          Ei jaettuja käyttäjiä
        </Text>
      ) : (
        <ScrollView style={{ maxHeight: 300 }}>
          {sharedUsers.map((sharedUser) => {
            // Don't show the current user if they're not the owner
            if (sharedUser.id === user?.id && sharedUser.role !== 'omistaja') {
              return null;
            }

            return (
              <View key={sharedUser.id} style={styles.sharedUserItem}>
                <View style={styles.sharedUserInfo}>
                  <Text style={styles.sharedUserName}>
                    {sharedUser.name || sharedUser.username}
                  </Text>
                  <Text style={styles.sharedUserEmail}>
                    @{sharedUser.username}
                  </Text>
                  
                  {isOwner && sharedUser.role !== 'omistaja' ? (
                    <Chip
                      mode="flat"
                      style={{ alignSelf: 'flex-start', marginTop: 4 }}
                      textStyle={{ fontSize: 11 }}
                      onPress={() => handleEditSharedUserRole(sharedUser)}
                      icon="pencil"
                    >
                      {sharedUser.role}
                    </Chip>
                  ) : (
                    <Chip
                      mode="flat"
                      style={{ alignSelf: 'flex-start', marginTop: 4 }}
                      textStyle={{ fontSize: 11 }}
                    >
                      {sharedUser.role}
                    </Chip>
                  )}
                </View>

                {isOwner && sharedUser.role !== 'omistaja' && (
                  <IconButton
                    icon="delete"
                    iconColor={COLORS.error}
                    size={20}
                    onPress={() => handleRemoveUser(sharedUser.id, sharedUser.username)}
                    style={styles.removeButton}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Button
        mode="outlined"
        onPress={loadSharedUsers}
        icon="refresh"
        style={{ marginTop: 16 }}
      >
        Päivitä lista
      </Button>
    </View>
  );

  if (!isOwner) {
    return (
      <Portal>
        <Dialog visible={visible} onDismiss={handleClose}>
          <Dialog.Title>Jako ei käytettävissä</Dialog.Title>
          <Dialog.Content>
            <Text>Vain lemmikin omistaja voi jakaa lemmikin muille käyttäjille.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleClose}>Sulje</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={{ maxHeight: '80%' }}>
        <Dialog.Title>Jaa lemmikki: {petName}</Dialog.Title>
        
        <Dialog.Content style={styles.dialogContent}>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Button
              mode={activeTab === 'generate' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('generate')}
              style={{ flex: 1, marginRight: 8 }}
            >
              Luo koodi
            </Button>
            <Button
              mode={activeTab === 'manage' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('manage')}
              style={{ flex: 1, marginLeft: 8 }}
            >
              Hallinnoi
            </Button>
          </View>

          {activeTab === 'generate' ? renderGenerateTab() : renderManageTab()}
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleClose}>Sulje</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog 
        visible={roleEditDialogVisible} 
        onDismiss={() => setRoleEditDialogVisible(false)}
        style={{ backgroundColor: COLORS.background }}
      >
        <Dialog.Title>Muuta roolia</Dialog.Title>
        <Dialog.Content>
          <View style={{ gap: SPACING.sm }}>
            <Button
              mode="contained"
              onPress={() => handleUpdateRole('omistaja')}
              disabled={isUpdatingRole}
              loading={isUpdatingRole && editingSharedUser?.role !== 'omistaja'}
              icon="crown"
              style={{ justifyContent: 'flex-start' }}
            >
              Omistaja
            </Button>
            <Button
              mode="contained"
              onPress={() => handleUpdateRole('hoitaja')}
              disabled={isUpdatingRole}
              loading={isUpdatingRole && editingSharedUser?.role !== 'hoitaja'}
              icon="account-heart"
              style={{ justifyContent: 'flex-start' }}
            >
              Hoitaja
            </Button>
            <Button
              mode="contained"
              onPress={() => handleUpdateRole('lääkäri')}
              disabled={isUpdatingRole}
              loading={isUpdatingRole && editingSharedUser?.role !== 'lääkäri'}
              icon="stethoscope"
              style={{ justifyContent: 'flex-start' }}
            >
              Lääkäri
            </Button>
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}
