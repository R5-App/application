/**
 * Screen Styles
 * HomeScreen, PetsScreen, SettingsScreen
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, COMMON_STYLES, LAYOUT, TYPOGRAPHY } from './theme';

// ============================================
// HOME SCREEN STYLES
// ============================================
export const homeStyles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.container,
  },
  
  header: {
    padding: LAYOUT.screenPadding,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.primaryContainer,
  },
  
  title: {
    ...TYPOGRAPHY.displaySmall,
    color: COLORS.onPrimaryContainer,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  
  subtitle: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onPrimaryContainer,
    textAlign: 'center',
  },
  
  content: {
    padding: LAYOUT.screenPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  section: {
    marginBottom: LAYOUT.sectionSpacing,
  },
  
  sectionTitle: {
    ...COMMON_STYLES.sectionTitle,
  },
  
  card: {
    ...COMMON_STYLES.card,
    width: '48%',
    marginBottom: SPACING.md,
    minHeight: 180,
  },
  
  cardText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
  },
  
  text: {
    ...COMMON_STYLES.textPrimary,
  },
});

// ============================================
// PETS SCREEN STYLES
// ============================================
export const petsStyles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.container,
    padding: LAYOUT.screenPadding,
  },
  
  title: {
    ...TYPOGRAPHY.headlineMedium,
    marginBottom: SPACING.lg,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT.screenPadding,
  },
  
  emptyText: {
    ...COMMON_STYLES.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  
  listContent: {
    paddingBottom: SPACING['2xl'],
  },
  
  card: {
    ...COMMON_STYLES.card,
  },
  
  petName: {
    ...TYPOGRAPHY.titleLarge,
    marginBottom: SPACING.xs,
  },
  
  petInfo: {
    ...COMMON_STYLES.textSecondary,
  },
  
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryContainer,
  },
});

// ============================================
// SETTINGS SCREEN STYLES
// ============================================
export const settingsStyles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.container,
  },
  
  section: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  
  sectionTitle: {
    ...COMMON_STYLES.sectionTitle,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceVariant,
  },
  
  buttonContainer: {
    padding: LAYOUT.screenPadding,
  },
  
  button: {
    ...COMMON_STYLES.button,
  },
});

// ============================================
// PROFILE SCREEN STYLES
// ============================================
export const profileStyles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.container,
  },
  
  header: {
    alignItems: 'center',
    padding: LAYOUT.screenPadding,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.primaryContainer,
  },
  
  title: {
    ...TYPOGRAPHY.headlineMedium,
    color: COLORS.onPrimaryContainer,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  
  card: {
    ...COMMON_STYLES.card,
    margin: LAYOUT.screenPadding,
    marginBottom: SPACING.md,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  
  infoLabel: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  
  infoValue: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.onSurface,
    flex: 1,
    textAlign: 'right',
  },
  
  divider: {
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.outlineVariant,
  },
  
  actionButton: {
    justifyContent: 'flex-start',
    marginVertical: SPACING.xs,
  },
  
  buttonContent: {
    justifyContent: 'flex-start',
  },
  
  buttonLabel: {
    fontSize: 16,
    textAlign: 'left',
  },
  
  sectionTitle: {
    ...TYPOGRAPHY.titleMedium,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  
  sectionDescription: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.onSurfaceVariant,
  },
  
  logoutContainer: {
    padding: LAYOUT.screenPadding,
    paddingBottom: SPACING['2xl'],
  },
  
  logoutButton: {
    borderRadius: COMMON_STYLES.button.borderRadius,
  },
});
