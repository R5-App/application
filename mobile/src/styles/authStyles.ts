/**
 * Authentication Screens Styles
 * LoginScreen & RegisterScreen
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, COMMON_STYLES, LAYOUT, TYPOGRAPHY } from './theme';

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
  logoContainer: {
    ...COMMON_STYLES.logoContainer,
    alignSelf: 'center',
    marginBottom: SPACING['2xl'],
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
