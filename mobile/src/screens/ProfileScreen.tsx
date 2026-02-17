import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, Alert, Pressable } from 'react-native';
import { Text, Card, Button, Divider, Portal, Dialog, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import authService from '../services/authService';
import { profileStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';

export default function ProfileScreen() {
  const { user, logout, deleteAccount, updateUser } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [subUsersDialogVisible, setSubUsersDialogVisible] = useState(false);
  const [subUsers, setSubUsers] = useState<any[]>([]);
  const [isLoadingSubUsers, setIsLoadingSubUsers] = useState(false);
  const [selectedSubUserId, setSelectedSubUserId] = useState<string | null>(null);
  const [isDeletingSubUser, setIsDeletingSubUser] = useState(false);
  const [roleEditDialogVisible, setRoleEditDialogVisible] = useState(false);
  const [editingSubUser, setEditingSubUser] = useState<any>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [deleteSubUserDialogVisible, setDeleteSubUserDialogVisible] = useState(false);
  const [subUserToDelete, setSubUserToDelete] = useState<{id: string, username: string} | null>(null);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [hasSubUsers, setHasSubUsers] = useState(false);
  const [emailValidationDialogVisible, setEmailValidationDialogVisible] = useState(false);
  const [emailValidationMessage, setEmailValidationMessage] = useState({ title: '', message: '' });
  const [passwordValidationDialogVisible, setPasswordValidationDialogVisible] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] = useState({ title: '', message: '' });

  // Stable style objects to prevent TextInput cursor jumping
  const inputSpacing = useMemo(() => ({ marginBottom: SPACING.md }), []);

  // Stable callbacks to prevent TextInput re-renders
  const toggleOldPassword = useMemo(() => () => setShowOldPassword(prev => !prev), []);
  const toggleNewPassword = useMemo(() => () => setShowNewPassword(prev => !prev), []);
  const toggleConfirmPassword = useMemo(() => () => setShowConfirmPassword(prev => !prev), []);
  const toggleDeletePassword = useMemo(() => () => setShowDeletePassword(prev => !prev), []);

  // Check if user has sub-users on mount
  useEffect(() => {
    const checkSubUsers = async () => {
      try {
        const result = await authService.getSubUsers();
        if (result.success && result.data) {
          setHasSubUsers(result.data.length > 0);
        }
      } catch (error) {
        // Silently fail, button will remain hidden
      }
    };
    checkSubUsers();
  }, []);

  const handleChangeEmail = () => {
    setNewEmail(user?.email || '');
    setEmailDialogVisible(true);
  };

  const handleSaveEmail = async () => {
    if (!newEmail || !newEmail.trim()) {
      setEmailValidationMessage({ title: 'Virhe', message: 'Syötä uusi sähköpostiosoite' });
      setEmailValidationDialogVisible(true);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailValidationMessage({ title: 'Virhe', message: 'Syötä kelvollinen sähköpostiosoite' });
      setEmailValidationDialogVisible(true);
      return;
    }

    if (newEmail === user?.email) {
      setEmailValidationMessage({ title: 'Huomio', message: 'Uusi sähköposti on sama kuin nykyinen' });
      setEmailValidationDialogVisible(true);
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const result = await authService.updateEmail(newEmail);
      if (result.success && result.user) {
        // Merge updated user with existing user to preserve fields like created_at
        const updatedUser = { ...user, ...result.user };
        updateUser(updatedUser);
        setEmailValidationMessage({ title: 'Onnistui', message: result.message });
        setEmailValidationDialogVisible(true);
        setEmailDialogVisible(false);
        setNewEmail('');
      } else {
        setEmailValidationMessage({ title: 'Virhe', message: result.message });
        setEmailValidationDialogVisible(true);
      }
    } catch (error) {
      setEmailValidationMessage({ title: 'Virhe', message: 'Sähköpostin päivitys epäonnistui' });
      setEmailValidationDialogVisible(true);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleChangePassword = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordDialogVisible(true);
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordValidationMessage({ title: 'Virhe', message: 'Täytä kaikki kentät' });
      setPasswordValidationDialogVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordValidationMessage({ title: 'Virhe', message: 'Uudet salasanat eivät täsmää' });
      setPasswordValidationDialogVisible(true);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordValidationMessage({ title: 'Virhe', message: 'Salasanan tulee olla vähintään 8 merkkiä' });
      setPasswordValidationDialogVisible(true);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordValidationMessage({ title: 'Virhe', message: 'Salasanan tulee sisältää iso kirjain, pieni kirjain ja numero' });
      setPasswordValidationDialogVisible(true);
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordValidationMessage({ title: 'Huomio', message: 'Uusi salasana on sama kuin vanha' });
      setPasswordValidationDialogVisible(true);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await authService.updatePassword(oldPassword, newPassword);
      if (result.success) {
        setPasswordValidationMessage({ title: 'Onnistui', message: result.message });
        setPasswordValidationDialogVisible(true);
        setPasswordDialogVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordValidationMessage({ title: 'Virhe', message: result.message });
        setPasswordValidationDialogVisible(true);
      }
    } catch (error) {
      setPasswordValidationMessage({ title: 'Virhe', message: 'Salasanan päivitys epäonnistui' });
      setPasswordValidationDialogVisible(true);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleViewSubUsers = async () => {
    setSubUsersDialogVisible(true);
    setIsLoadingSubUsers(true);
    setSelectedSubUserId(null);
    try {
      const result = await authService.getSubUsers();
      
      if (result.success && result.data) {
        setSubUsers(result.data);
        setHasSubUsers(result.data.length > 0);
      } else {
        showSnackbar(result.message || 'Alikäyttäjien haku epäonnistui', 'error');
      }
    } catch (error) {
      console.error('Sub-users fetch exception:', error);
      showSnackbar('Alikäyttäjien haku epäonnistui', 'error');
    } finally {
      setIsLoadingSubUsers(false);
    }
  };

  const handleSelectSubUser = (subUserId: string) => {
    setSelectedSubUserId(prev => prev === subUserId ? null : subUserId);
  };

  const handleEditSubUserRole = (subUser: any) => {
    setEditingSubUser(subUser);
    setRoleEditDialogVisible(true);
  };

  const handleUpdateRole = async (newRole: string) => {
    if (!editingSubUser) return;

    setIsUpdatingRole(true);
    try {
      const result = await authService.updateSubUserRole(editingSubUser.id, newRole);
      if (result.success) {
        showSnackbar(result.message, 'success');
        setRoleEditDialogVisible(false);
        setSelectedSubUserId(null);
        // Refresh the sub-users list
        const refreshResult = await authService.getSubUsers();
        if (refreshResult.success && refreshResult.data) {
          setSubUsers(refreshResult.data);
        }
      } else {
        showSnackbar(result.message, 'error');
      }
    } catch (error) {
      showSnackbar('Roolin päivitys epäonnistui', 'error');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteSubUser = (subUserId: string, username: string) => {
    setSubUserToDelete({ id: subUserId, username });
    setDeleteSubUserDialogVisible(true);
  };

  const handleConfirmDeleteSubUser = async () => {
    if (!subUserToDelete) return;

    setIsDeletingSubUser(true);
    try {
      const result = await authService.deleteSubUser(subUserToDelete.id);
      if (result.success) {
        showSnackbar(result.message, 'success');
        setSelectedSubUserId(null);
        setDeleteSubUserDialogVisible(false);
        // Refresh the sub-users list
        const refreshResult = await authService.getSubUsers();
        if (refreshResult.success && refreshResult.data) {
          setSubUsers(refreshResult.data);
          setHasSubUsers(refreshResult.data.length > 0);
        }
      } else {
        showSnackbar(result.message, 'error');
      }
    } catch (error) {
      showSnackbar('Alikäyttäjän poisto epäonnistui', 'error');
    } finally {
      setIsDeletingSubUser(false);
      setSubUserToDelete(null);
    }
  };

  const handleDeleteAccount = () => {
    setDeletePassword('');
    setShowDeletePassword(false);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      Alert.alert('Virhe', 'Syötä salasanasi vahvistaaksesi tilin poiston');
      return;
    }

    if (!user?.id) {
      Alert.alert('Virhe', 'Käyttäjätietoja ei löytynyt');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAccount(user.id, deletePassword);
      if (result.success) {
        setDeleteDialogVisible(false);
        setDeletePassword('');
        // Show success message
        showSnackbar(result.message, 'success');
        // AuthContext deleteAccount updates state and triggers navigation
      } else {
        Alert.alert('Virhe', result.message);
      }
    } catch (error) {
      Alert.alert('Virhe', 'Tilin poisto epäonnistui. Yritä uudelleen.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogVisible(false);
    await logout();
  };

  // Format date to Finnish format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Ei tiedossa';
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI');
  };

  // Get last seen date (mock data for now)
  const getLastSeen = () => {
    return new Date().toLocaleDateString('fi-FI');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={100} color={COLORS.primary} />
        <Text variant="headlineMedium" style={styles.title}>
          {user?.name || user?.username}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Nimimerkki:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {user?.username}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Sähköposti:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {user?.email}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Tili luotu:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {formatDate(user?.created_at || user?.createdAt)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <Text variant="bodyLarge" style={styles.infoLabel}>
              Viimeksi paikalla:
            </Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              {getLastSeen()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="text"
            onPress={handleChangeEmail}
            icon="email-edit"
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            style={styles.actionButton}
          >
            Muuta sähköposti
          </Button>

          <Button
            mode="text"
            onPress={handleChangePassword}
            icon="lock-reset"
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            style={styles.actionButton}
          >
            Muuta salasanaa
          </Button>

          <Button
            mode="text"
            onPress={handleDeleteAccount}
            icon="delete"
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: COLORS.error }]}
            style={styles.actionButton}
            textColor={COLORS.error}
            disabled={isDeleting}
            loading={isDeleting}
          >
            Poista tili
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
          textColor={COLORS.error}
          style={{ borderColor: COLORS.error }}
        >
          Kirjaudu ulos
        </Button>
      </View>

      <Portal>
        <Dialog 
        visible={emailDialogVisible} 
        onDismiss={() => setEmailDialogVisible(false)}
        style={{ backgroundColor: COLORS.background }}
        >
          <Dialog.Title>Muuta sähköposti</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Uusi sähköpostiosoite"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              disabled={isUpdatingEmail}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEmailDialogVisible(false)} disabled={isUpdatingEmail}>
              Peruuta
            </Button>
            <Button onPress={handleSaveEmail} loading={isUpdatingEmail} disabled={isUpdatingEmail}>
              Tallenna
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
        visible={deleteDialogVisible} 
        onDismiss={() => setDeleteDialogVisible(false)}
        style={{ backgroundColor: COLORS.background }}
        >
          <Dialog.Title>Poista tili</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: SPACING.md }}>
              Haluatko varmasti poistaa tilisi? Tätä toimintoa ei voi peruuttaa.
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: SPACING.md, fontWeight: 'bold' }}>
              Syötä salasanasi vahvistaaksesi:
            </Text>
            <TextInput
              label="Salasana"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry={!showDeletePassword}
              autoCapitalize="none"
              disabled={isDeleting}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={showDeletePassword ? 'eye-off' : 'eye'}
                  onPress={toggleDeletePassword}
                />
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} disabled={isDeleting}>
              Peruuta
            </Button>
            <Button 
              onPress={handleConfirmDelete} 
              loading={isDeleting} 
              disabled={isDeleting}
              textColor={COLORS.error}
            >
              Poista tili
            </Button>
          </Dialog.Actions>
        </Dialog>
 
        <Dialog 
          visible={subUsersDialogVisible} 
          onDismiss={() => setSubUsersDialogVisible(false)}
          style={{ backgroundColor: COLORS.background }}
        >
          <Dialog.Title>Alikäyttäjät</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: SPACING.md }}>
              Tähän tiliin liitetyt alikäyttäjät:
            </Text>
            {isLoadingSubUsers ? (
              <View style={{ padding: SPACING.md, alignItems: 'center' }}>
                <Text variant="bodyMedium">Ladataan...</Text>
              </View>
            ) : subUsers.length > 0 ? (
              <View>
                {subUsers.map((subUser, index) => (
                  <View 
                    key={subUser.id || index}
                    style={{
                      marginBottom: index < subUsers.length - 1 ? SPACING.sm : 0
                    }}
                  >
                    <Pressable
                      onPress={() => handleSelectSubUser(subUser.id)}
                      style={{ 
                        padding: SPACING.md, 
                        backgroundColor: COLORS.surface, 
                        borderRadius: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: selectedSubUserId && selectedSubUserId !== subUser.id ? 0.4 : 1
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyLarge" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                          {subUser.username}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <MaterialCommunityIcons name="email" size={16} color={COLORS.onSurfaceVariant} style={{ marginRight: 8 }} />
                          <Text variant="bodyMedium" style={{ color: COLORS.onSurfaceVariant }}>
                            {subUser.email}
                          </Text>
                        </View>
                        {subUser.role && (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="shield-account" size={16} color={COLORS.onSurfaceVariant} style={{ marginRight: 8 }} />
                            <Text variant="bodySmall" style={{ color: COLORS.onSurfaceVariant, textTransform: 'capitalize' }}>
                              {subUser.role}
                            </Text>
                          </View>
                        )}
                      </View>
                      {selectedSubUserId === subUser.id && (
                        <View style={{ flexDirection: 'column', gap: SPACING.sm }}>
                          <Pressable
                            onPress={() => handleEditSubUserRole(subUser)}
                            disabled={isDeletingSubUser}
                            style={{ padding: 8 }}
                          >
                            <MaterialCommunityIcons name="pencil" size={24} color={COLORS.primary} />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteSubUser(subUser.id, subUser.username)}
                            disabled={isDeletingSubUser}
                            style={{ padding: 8 }}
                          >
                            <MaterialCommunityIcons name="delete" size={24} color={COLORS.error} />
                          </Pressable>
                        </View>
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ padding: SPACING.md, backgroundColor: COLORS.surfaceVariant, borderRadius: 8 }}>
                <Text variant="bodyMedium" style={{ color: COLORS.onSurfaceVariant, fontStyle: 'italic' }}>
                  Ei alikäyttäjiä vielä lisätty.
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSubUsersDialogVisible(false)}>
              Sulje
            </Button>
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
                loading={isUpdatingRole && editingSubUser?.role !== 'omistaja'}
                icon="crown"
                style={{ justifyContent: 'flex-start' }}
              >
                Omistaja
              </Button>
              <Button
                mode="contained"
                onPress={() => handleUpdateRole('hoitaja')}
                disabled={isUpdatingRole}
                loading={isUpdatingRole && editingSubUser?.role !== 'hoitaja'}
                icon="account-heart"
                style={{ justifyContent: 'flex-start' }}
              >
                Hoitaja
              </Button>
              <Button
                mode="contained"
                onPress={() => handleUpdateRole('lääkäri')}
                disabled={isUpdatingRole}
                loading={isUpdatingRole && editingSubUser?.role !== 'lääkäri'}
                icon="stethoscope"
                style={{ justifyContent: 'flex-start' }}
              >
                Lääkäri
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>

        <Dialog 
          visible={deleteSubUserDialogVisible} 
          onDismiss={() => setDeleteSubUserDialogVisible(false)}
          style={{ backgroundColor: COLORS.dialogBackground }}
        >
          <Dialog.Title>Poista alikäyttäjä</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Haluatko varmasti poistaa alikäyttäjän "{subUserToDelete?.username}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteSubUserDialogVisible(false)} disabled={isDeletingSubUser}>
              Peruuta
            </Button>
            <Button 
              onPress={handleConfirmDeleteSubUser} 
              loading={isDeletingSubUser} 
              disabled={isDeletingSubUser}
              textColor={COLORS.error}
            >
              Poista
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={passwordValidationDialogVisible} 
          onDismiss={() => setPasswordValidationDialogVisible(false)}
          style={{ backgroundColor: COLORS.dialogBackground }}
        >
          <Dialog.Title>{passwordValidationMessage.title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {passwordValidationMessage.message}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordValidationDialogVisible(false)}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={emailValidationDialogVisible} 
          onDismiss={() => setEmailValidationDialogVisible(false)}
          style={{ backgroundColor: COLORS.dialogBackground }}
        >
          <Dialog.Title>{emailValidationMessage.title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {emailValidationMessage.message}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEmailValidationDialogVisible(false)}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={logoutDialogVisible} 
          onDismiss={() => setLogoutDialogVisible(false)}
          style={{ backgroundColor: COLORS.dialogBackground }}
        >
          <Dialog.Title>Kirjaudu ulos</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Haluatko varmasti kirjautua ulos?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>
              Peruuta
            </Button>
            <Button 
              onPress={handleConfirmLogout}
              textColor={COLORS.error}
            >
              Kirjaudu ulos
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
        visible={passwordDialogVisible} 
        onDismiss={() => setPasswordDialogVisible(false)}
        style={{ backgroundColor: COLORS.background }}
        >
          <Dialog.Title>Muuta salasana</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Vanha salasana"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry={!showOldPassword}
              autoCapitalize="none"
              disabled={isUpdatingPassword}
              mode="outlined"
              style={inputSpacing}
              right={
                <TextInput.Icon
                  icon={showOldPassword ? 'eye-off' : 'eye'}
                  onPress={toggleOldPassword}
                />
              }
            />
            <TextInput
              label="Uusi salasana"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              disabled={isUpdatingPassword}
              mode="outlined"
              style={inputSpacing}
              right={
                <TextInput.Icon
                  icon={showNewPassword ? 'eye-off' : 'eye'}
                  onPress={toggleNewPassword}
                />
              }
            />
            <TextInput
              label="Vahvista uusi salasana"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              disabled={isUpdatingPassword}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={toggleConfirmPassword}
                />
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialogVisible(false)} disabled={isUpdatingPassword}>
              Peruuta
            </Button>
            <Button onPress={handleSavePassword} loading={isUpdatingPassword} disabled={isUpdatingPassword}>
              Tallenna
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
