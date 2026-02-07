/**
 * MyPet App - Material Design 3 Theme
 * 
 * Tämä tiedosto määrittelee sovelluksen Material Design 3 -yhteensopivan teeman.
 * Perustuu React Native Paper MD3 -teemaan ja noudattaa Material Design 3 -ohjeita.
 */

import { MD3LightTheme, MD3Theme as PaperMD3Theme } from 'react-native-paper';

// ============================================
// MATERIAL DESIGN 3 VÄRIT
// ============================================

export const COLORS = {
  // MD3 Primary Color Scheme
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  
  // MD3 Secondary Color Scheme
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  
  // MD3 Tertiary Color Scheme
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  
  // MD3 Error Color Scheme
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  
  // MD3 Background & Surface
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  
  // MD3 Outline
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  
  // MD3 Inverse Colors
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  
  // Custom Status Colors (yhteensopivat MD3:n kanssa)
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Utilities
  shadow: 'rgba(0, 0, 0, 0.15)',
  scrim: 'rgba(0, 0, 0, 0.32)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  dialogBackground: 'rgba(255, 255, 255, 0.95)',
  placeholderText: 'rgba(0, 0, 0, 0.3)',
  
  // Calendar Event Colors (MD3-yhteensopivat)
  vaccination: '#4CAF50',
  veterinary: '#2196F3',
  medication: '#FF9800',
  grooming: '#9C27B0',
  other: '#607D8B',
};

// ============================================
// MD3 TYPOGRAFIA (Typography Scale)
// ============================================

export const TYPOGRAPHY = {
  // MD3 Display Typography
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '400' as const },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' as const },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '400' as const },
  
  // MD3 Headline Typography
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '400' as const },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '400' as const },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '400' as const },
  
  // MD3 Title Typography
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '400' as const },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  
  // MD3 Label Typography
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const },
  
  // MD3 Body Typography
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
};

// ============================================
// SPACING (Välit)
// ============================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

// ============================================
// MD3 BORDER RADIUS (Shape Scale)
// ============================================

export const BORDER_RADIUS = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
};

// ============================================
// MD3 ELEVATION (Varjot)
// ============================================

export const ELEVATION = {
  level0: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  level2: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  level3: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  level4: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  level5: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
};

// ============================================
// LAYOUT (Asettelut)
// ============================================

export const LAYOUT = {
  // Näytön reunavälit
  screenPadding: SPACING.lg,
  screenPaddingSm: SPACING.md,
  
  // Korttien välit
  cardPadding: SPACING.md,
  cardMargin: SPACING.md,
  
  // Section välit
  sectionSpacing: SPACING.xl,
  sectionTitleMargin: SPACING.md,
  
  // Input korkeudet
  inputHeight: 56,
  buttonHeight: 48,
  
  // Icon koot
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
  
  // Border radius
  radiusSm: BORDER_RADIUS.small,
  radiusMd: BORDER_RADIUS.medium,
  radiusLg: BORDER_RADIUS.large,
  radiusXl: BORDER_RADIUS.extraLarge,
};

// ============================================
// COMMON STYLES (Yleiset tyylit)
// ============================================

export const COMMON_STYLES = {
  // Container tyylit
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  contentContainer: {
    padding: LAYOUT.screenPadding,
  },
  
  // Kortti tyyli
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.medium,
    padding: LAYOUT.cardPadding,
    marginBottom: LAYOUT.cardMargin,
    ...ELEVATION.level2,
  },
  
  // Input tyyli
  input: {
    marginBottom: SPACING.md,
  },
  
  // Button tyylit
  button: {
    marginBottom: SPACING.md,
  },
  
  buttonContent: {
    height: LAYOUT.buttonHeight,
  },
  
  // Section otsikko
  sectionTitle: {
    ...TYPOGRAPHY.titleLarge,
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  
  // Teksti tyylit
  textPrimary: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onBackground,
  },
  
  textSecondary: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
  },
  
  // Keskitys
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Flex tyylit
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  // Logo/Image container
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.large,
  },
};

// ============================================
// EXPORT ALL
// ============================================

// MD3 Theme for React Native Paper
export const MD3Theme: PaperMD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    onPrimary: COLORS.onPrimary,
    primaryContainer: COLORS.primaryContainer,
    onPrimaryContainer: COLORS.onPrimaryContainer,
    secondary: COLORS.secondary,
    onSecondary: COLORS.onSecondary,
    secondaryContainer: COLORS.secondaryContainer,
    onSecondaryContainer: COLORS.onSecondaryContainer,
    tertiary: COLORS.tertiary,
    onTertiary: COLORS.onTertiary,
    tertiaryContainer: COLORS.tertiaryContainer,
    onTertiaryContainer: COLORS.onTertiaryContainer,
    error: COLORS.error,
    onError: COLORS.onError,
    errorContainer: COLORS.errorContainer,
    onErrorContainer: COLORS.onErrorContainer,
    background: COLORS.background,
    onBackground: COLORS.onBackground,
    surface: COLORS.surface,
    onSurface: COLORS.onSurface,
    surfaceVariant: COLORS.surfaceVariant,
    onSurfaceVariant: COLORS.onSurfaceVariant,
    outline: COLORS.outline,
    outlineVariant: COLORS.outlineVariant,
    shadow: COLORS.shadow,
    scrim: COLORS.scrim,
    inverseSurface: COLORS.inverseSurface,
    inverseOnSurface: COLORS.inverseOnSurface,
    inversePrimary: COLORS.inversePrimary,
  },
};

export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  elevation: ELEVATION,
  layout: LAYOUT,
  commonStyles: COMMON_STYLES,
};

export default MD3Theme;
