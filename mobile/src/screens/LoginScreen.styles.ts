import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
});
