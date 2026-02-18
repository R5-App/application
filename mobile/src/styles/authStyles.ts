/**
 * Authentication Screens Styles
 * LoginScreen & RegisterScreen
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, COMMON_STYLES, LAYOUT, TYPOGRAPHY } from './theme';

export const authStyles = StyleSheet.create({
  // Container & Layout
  container: {
    ...COMMON_STYLES.container,
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: LAYOUT.screenPadding,
  },
  
  scrollContentRegister: {
    flexGrow: 1,
    padding: LAYOUT.screenPadding,
    paddingTop: SPACING['2xl'],
  },
  
  // Logo
  logoContainer1: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: SPACING['2xl'],
    top: -SPACING['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer2: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: SPACING['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logoImage: {
    width: 350,
    height: 350,
  },
  
  logoText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurfaceVariant,
  },
  
  // Title
  title: {
    ...TYPOGRAPHY.headlineMedium,
    textAlign: 'center',
    marginBottom: LAYOUT.sectionSpacing,
  },
  
  // Form Elements
  input: {
    ...COMMON_STYLES.input,
  },
  
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.sectionSpacing,
  },
  
  passwordHint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.md,
    marginTop: -SPACING.sm,
  },
  
  // Buttons
  loginButton: {
    ...COMMON_STYLES.button,
  },
  
  registerButton: {
    ...COMMON_STYLES.button,
  },
  
  backButton: {
    marginTop: SPACING.sm,
  },
  
  buttonContent: {
    ...COMMON_STYLES.buttonContent,
  },
  
  
  // Links
  forgotPassword: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },
});
