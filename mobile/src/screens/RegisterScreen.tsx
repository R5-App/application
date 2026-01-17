import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useAuth } from '@contexts/AuthContext';
import { useSnackbar } from '@contexts/SnackbarContext';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !username || !password || !confirmPassword) {
      showSnackbar('Täytä kaikki pakolliset kentät', 'warning');
      return false;
    }

    if (password !== confirmPassword) {
      showSnackbar('Salasanat eivät täsmää', 'warning');
      return false;
    }

    if (password.length < 8) {
      showSnackbar('Salasanan tulee olla vähintään 8 merkkiä', 'warning');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      showSnackbar('Salasanan tulee sisältää iso kirjain, pieni kirjain ja numero', 'warning');
      return false;
    }

    if (username.length < 3) {
      showSnackbar('Nimimerkin tulee olla vähintään 3 merkkiä', 'warning');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        email,
        username,
        password,
        name,
      });

      if (result.success) {
        showSnackbar('Rekisteröinti onnistui!', 'success');
      } else {
        showSnackbar(result.message, 'error');
      }
    } catch (err) {
      showSnackbar('Rekisteröinti epäonnistui', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.logoContainer}>
          <Text style={styles.logoText}>Logo</Text>
        </Surface>

        <Text variant="headlineSmall" style={styles.title}>
          Luo uusi tili
        </Text>

        <TextInput
          label="Sähköposti *"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Nimimerkki *"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Nimi"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          label="Salasana *"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
        />

        <TextInput
          label="Vahvista salasana *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry={!showConfirmPassword}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          style={styles.input}
        />

        <Text variant="bodySmall" style={styles.passwordHint}>
          Salasanan tulee olla vähintään 8 merkkiä ja sisältää iso kirjain, pieni kirjain ja numero
        </Text>

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.registerButton}
          contentStyle={styles.buttonContent}
        >
          Rekisteröidy
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          Takaisin kirjautumiseen
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
  },
  logoText: {
    fontSize: 18,
    color: '#999',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  passwordHint: {
    color: '#666',
    marginBottom: 16,
    marginTop: -8,
  },
  errorText: {
    color: '#b00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  registerButton: {
    marginBottom: 12,
  },
  backButton: {
    marginTop: 8,
  },
  buttonContent: {
    height: 48,
  },
});
