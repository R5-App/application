import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
