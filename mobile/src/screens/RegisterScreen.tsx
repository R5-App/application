import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text  } from 'react-native-paper';
import { useAuth } from '@contexts/AuthContext';
import { useSnackbar } from '@contexts/SnackbarContext';
import { authStyles } from '../styles/authStyles';

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
      style={authStyles.container}
    >
      <ScrollView
        contentContainerStyle={authStyles.scrollContentRegister}
        keyboardShouldPersistTaps="handled"
      >
        <View style={authStyles.logoContainer2}>
          <Image
            source={require('../assets/images/image.png')}
            style={authStyles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text variant="headlineSmall" style={authStyles.title}>
          Luo uusi tili
        </Text>

        <TextInput
          label="Sähköposti *"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={authStyles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Nimimerkki *"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={authStyles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Nimi"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={authStyles.input}
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
          style={authStyles.input}
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
          style={authStyles.input}
        />

        <Text variant="bodySmall" style={authStyles.passwordHint}>
          Salasanan tulee olla vähintään 8 merkkiä ja sisältää iso kirjain, pieni kirjain ja numero
        </Text>

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={authStyles.registerButton}
          contentStyle={authStyles.buttonContent}
        >
          Rekisteröidy
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={authStyles.backButton}
          disabled={loading}
        >
          Takaisin kirjautumiseen
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
