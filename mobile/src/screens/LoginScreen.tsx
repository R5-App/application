import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Checkbox, Surface } from 'react-native-paper';
import { useAuth } from '@contexts/AuthContext';
import { useSnackbar } from '@contexts/SnackbarContext';

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
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.logoContainer}>
          <Text style={styles.logoText}>Logo</Text>
        </Surface>

        <TextInput
          label="Nimimerkki"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
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
          style={styles.input}
        />

        <View style={styles.checkboxContainer}>
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
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
        >
          Kirjaudu sisään
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={styles.registerButton}
          contentStyle={styles.buttonContent}
        >
          Rekisteröidy
        </Button>

        <Text
          style={styles.forgotPassword}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#f0f0f0',
  },
  logoText: {
    fontSize: 18,
    color: '#999',
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: '#b00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    marginBottom: 12,
  },
  registerButton: {
    marginBottom: 16,
  },
  buttonContent: {
    height: 48,
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#6200ee',
    marginTop: 8,
  },
});
