import React, { useState, useMemo } from 'react';
import { View, ScrollView, Alert } from 'react-native';
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

  // Stable style objects to prevent TextInput cursor jumping
  const inputSpacing = useMemo(() => ({ marginBottom: SPACING.md }), []);

  // Stable callbacks to prevent TextInput re-renders
  const toggleOldPassword = useMemo(() => () => setShowOldPassword(prev => !prev), []);
  const toggleNewPassword = useMemo(() => () => setShowNewPassword(prev => !prev), []);
  const toggleConfirmPassword = useMemo(() => () => setShowConfirmPassword(prev => !prev), []);
  const toggleDeletePassword = useMemo(() => () => setShowDeletePassword(prev => !prev), []);

  const handleChangeEmail = () => {
    setNewEmail(user?.email || '');
    setEmailDialogVisible(true);
  };

  const handleSaveEmail = async () => {
    if (!newEmail || !newEmail.trim()) {
      Alert.alert('Virhe', 'Syötä uusi sähköpostiosoite');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Virhe', 'Syötä kelvollinen sähköpostiosoite');
      return;
    }

    if (newEmail === user?.email) {
      Alert.alert('Huomio', 'Uusi sähköposti on sama kuin nykyinen');
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const result = await authService.updateEmail(newEmail);
      if (result.success && result.user) {
        // Merge updated user with existing user to preserve fields like created_at
        const updatedUser = { ...user, ...result.user };
        updateUser(updatedUser);
        Alert.alert('Onnistui', result.message);
        setEmailDialogVisible(false);
        setNewEmail('');
      } else {
        Alert.alert('Virhe', result.message);
      }
    } catch (error) {
      Alert.alert('Virhe', 'Sähköpostin päivitys epäonnistui');
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
      Alert.alert('Virhe', 'Täytä kaikki kentät');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Virhe', 'Uudet salasanat eivät täsmää');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Virhe', 'Salasanan tulee olla vähintään 8 merkkiä');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      Alert.alert('Virhe', 'Salasanan tulee sisältää iso kirjain, pieni kirjain ja numero');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Huomio', 'Uusi salasana on sama kuin vanha');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await authService.updatePassword(oldPassword, newPassword);
      if (result.success) {
        Alert.alert('Onnistui', result.message);
        setPasswordDialogVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Virhe', result.message);
      }
    } catch (error) {
      Alert.alert('Virhe', 'Salasanan päivitys epäonnistui');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleViewSubUsers = async () => {
    setSubUsersDialogVisible(true);
    setIsLoadingSubUsers(true);
    try {
      const result = await authService.getSubUsers();
      if (result.success && result.data) {
        setSubUsers(result.data);
      } else {
        showSnackbar(result.message || 'Alikäyttäjien haku epäonnistui', 'error');
      }
    } catch (error) {
      showSnackbar('Alikäyttäjien haku epäonnistui', 'error');
    } finally {
      setIsLoadingSubUsers(false);
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

  const handleLogout = async () => {
    Alert.alert('Kirjaudu ulos', 'Haluatko varmasti kirjautua ulos?', [
      { text: 'Peruuta', style: 'cancel' },
      {
        text: 'Kirjaudu ulos',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
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
            onPress={handleViewSubUsers}
            icon="account-group"
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            style={styles.actionButton}
          >
            Näytä alikäyttäjät
          </Button>

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

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Sovelluksen asetukset
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Lisää asetuksia tulossa pian...
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          icon="logout"
          buttonColor={COLORS.error}
          style={styles.logoutButton}
        >
          Kirjaudu ulos
        </Button>
      </View>

      <Portal>
        <Dialog visible={emailDialogVisible} onDismiss={() => setEmailDialogVisible(false)}>
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

        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
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

        <Dialog visible={subUsersDialogVisible} onDismiss={() => setSubUsersDialogVisible(false)}>
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
                      padding: SPACING.md, 
                      backgroundColor: COLORS.surfaceVariant, 
                      borderRadius: 8,
                      marginBottom: index < subUsers.length - 1 ? SPACING.sm : 0
                    }}
                  >
                    <Text variant="bodyLarge" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {subUser.name || subUser.username}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: COLORS.onSurfaceVariant }}>
                      {subUser.email}
                    </Text>
                    {subUser.username && subUser.name && (
                      <Text variant="bodySmall" style={{ color: COLORS.onSurfaceVariant, marginTop: 4 }}>
                        @{subUser.username}
                      </Text>
                    )}
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

        <Dialog visible={passwordDialogVisible} onDismiss={() => setPasswordDialogVisible(false)}>
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
