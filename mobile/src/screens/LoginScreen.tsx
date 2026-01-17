import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Checkbox, Surface } from 'react-native-paper';
import { useAuth } from '@contexts/AuthContext';
import { useSnackbar } from '@contexts/SnackbarContext';
import { authStyles } from '../styles/authStyles';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      showSnackbar('Täytä kaikki kentät', 'warning');
      return;
    }

    setLoading(true);

    try {
      const result = await login({ username, password });
      if (result.success) {
        showSnackbar('Kirjautuminen onnistui!', 'success');
      } else {
        showSnackbar(result.message, 'error');
      }
    } catch (err) {
      showSnackbar('Kirjautuminen epäonnistui', 'error');
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
        contentContainerStyle={authStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={authStyles.logoContainer}>
          <Text style={authStyles.logoText}>Logo</Text>
        </Surface>

        <TextInput
          label="Nimimerkki"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={authStyles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Salasana"
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

        <View style={authStyles.checkboxContainer}>
          <Checkbox
            status={rememberMe ? 'checked' : 'unchecked'}
            onPress={() => setRememberMe(!rememberMe)}
          />
          <Text onPress={() => setRememberMe(!rememberMe)}>Pysy kirjautuneena sisään</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={authStyles.loginButton}
          contentStyle={authStyles.buttonContent}
        >
          Kirjaudu sisään
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={authStyles.registerButton}
          contentStyle={authStyles.buttonContent}
        >
          Rekisteröidy
        </Button>

        <Text
          style={authStyles.forgotPassword}
          onPress={() => {
            showSnackbar('Tämä toiminnallisuus on vielä kehitteillä', 'info');
          }}
        >
          Unohditko salasananan?
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
