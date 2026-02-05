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
    marginBottom: 0,
  },
});

// ============================================
// VISITS SCREEN STYLES
// ============================================
export const visitsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },

  title: {
    fontWeight: 'bold',
    color: COLORS.onBackground,
  },

  tabsContainer: {
    maxHeight: 70,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },

  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  tab: {
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedTab: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },

  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
  },

  unselectedTabText: {
    fontSize: 15,
    lineHeight: 20,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  visitCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },

  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  dateText: {
    fontWeight: '600',
    color: COLORS.primary,
  },

  divider: {
    marginVertical: SPACING.sm,
  },

  visitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  detailText: {
    flex: 1,
    color: COLORS.onSurface,
  },

  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },

  notesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
    alignItems: 'flex-start',
  },

  notesText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },

  cardActions: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  actionButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },

  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    marginTop: SPACING.xs,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryContainer,
  },

  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },

  keyboardAvoid: {
    width: '100%',
  },

  scrollContentContainer: {
    paddingBottom: 0,
  },

  modalTitle: {
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
  },

  input: {
    marginBottom: SPACING.md,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },

  modalButton: {
    flex: 1,
  },
});

// ============================================
// MEDICATIONS SCREEN STYLES
// ============================================
export const medicationsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  tabsContainer: {
    maxHeight: 70,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },

  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  tab: {
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedTab: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },

  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
  },

  unselectedTabText: {
    fontSize: 15,
    lineHeight: 20,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  medicationCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },

  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  medicationName: {
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },

  dosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  dosage: {
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  divider: {
    marginVertical: SPACING.sm,
  },

  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },

  notesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
    alignItems: 'flex-start',
  },

  notesText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },

   cardActions: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  actionButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },

  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    marginTop: SPACING.xs,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryContainer,
  },

  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },

  scrollContentContainer: {
    paddingBottom: 0,
  },

  modalTitle: {
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
  },

  input: {
    marginBottom: SPACING.md,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },

  modalButton: {
    flex: 1,
  },
});

// ============================================
// VACCINATIONS SCREEN STYLES
// ============================================
export const vaccinationsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  tabsContainer: {
    maxHeight: 70,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },

  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  tab: {
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedTab: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },

  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
  },

  unselectedTabText: {
    fontSize: 15,
    lineHeight: 20,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  vaccinationCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },

  vaccinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  vaccinationName: {
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  dateText: {
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  divider: {
    marginVertical: SPACING.sm,
  },

  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },

  notesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
    alignItems: 'flex-start',
  },

  notesText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },

  cardActions: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  actionButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },

  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    marginTop: SPACING.xs,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryContainer,
  },

  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },

  scrollContentContainer: {
    paddingBottom: 0,
  },

  modalTitle: {
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
  },

  input: {
    marginBottom: SPACING.md,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },

  modalButton: {
    flex: 1,
  },
});

// ============================================
// WEIGHTS SCREEN STYLES
// ============================================
export const weightsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  tabsContainer: {
    maxHeight: 70,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },

  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  tab: {
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedTab: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },

  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
  },

  unselectedTabText: {
    fontSize: 15,
    lineHeight: 20,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 80,
  },

  graphContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },

  graphTitle: {
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },

  graphContent: {
    flexDirection: 'row',
  },

  yAxisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  axisTitle: {
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },

  yAxisLabels: {
    width: 50,
    height: 220,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: SPACING.xs,
    marginTop: -50,
  },

  yAxisMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  axisLabel: {
    color: COLORS.onSurfaceVariant,
    textAlign: 'right',
    lineHeight: 12,
  },

  graphArea: {
    flex: 1,
    position: 'relative',
  },

  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    justifyContent: 'space-between',
  },

  gridLine: {
    height: 1,
    backgroundColor: COLORS.surfaceVariant,
    opacity: 0.5,
  },

  svgGraph: {
    marginBottom: SPACING.xs,
  },

  xAxisLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: SPACING.sm,
    position: 'relative',
    height: 20,
  },

  xAxisLabel: {
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    flex: 1,
    flexShrink: 1,
  },

  xAxisLabelShown: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    flex: 1,
  },

  xAxisTitle: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  yearTabsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
  },

  yearTabsContent: {
    gap: SPACING.xs,
    paddingHorizontal: 4,
  },

  yearTab: {
    backgroundColor: COLORS.surfaceVariant,
  },

  selectedYearTab: {
    backgroundColor: COLORS.primary,
  },

  selectedYearTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  unselectedYearTabText: {
    color: COLORS.onSurfaceVariant,
  },

  dividerSection: {
    paddingHorizontal: SPACING.md,
  },

  sectionTitle: {
    fontWeight: '600',
    color: COLORS.onSurface,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  
  weightCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },

  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  weightMainInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },

  weightValue: {
    fontWeight: '700',
    color: COLORS.primary,
  },

  weightUnit: {
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },

  changeChip: {
    marginLeft: SPACING.sm,
  },

  increaseChip: {
    backgroundColor: '#FFEBEE',
  },

  decreaseChip: {
    backgroundColor: '#E8F5E9',
  },

  increaseChipText: {
    color: '#D32F2F',
  },

  decreaseChipText: {
    color: '#2E7D32',
  },

  dateContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },

  dateText: {
    color: COLORS.onSurfaceVariant,
  },

  divider: {
    marginVertical: SPACING.sm,
  },

  weightDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  detailText: {
    flex: 1,
    color: COLORS.onSurface,
  },

    bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },

  notesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flex: 1,
    alignItems: 'flex-start',
  },

  notesText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },

     cardActions: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  actionButton: {
    padding: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },

  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    marginTop: SPACING.xs,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryContainer,
  },

  graphScrollView: {
    width: '100%',
  },

  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },

  scrollContentContainer: {
    paddingBottom: 0,
  },

  modalTitle: {
    marginBottom: SPACING.lg,
    fontWeight: 'bold',
    color: COLORS.onSurface,
  },

  input: {
    marginBottom: SPACING.md,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },

  modalButton: {
    flex: 1,
  },
});

// ============================================
// CALENDAR SCREEN STYLES
// ============================================
export const calendarStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },

  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.onSurfaceVariant,
  },

  emptyText: {
    marginTop: SPACING.xs,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primaryContainer,
  },

  tabsContainer: {
    maxHeight: 70,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },

  tabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  tab: {
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedTab: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },

  selectedTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
  },

  unselectedTabText: {
    fontSize: 15,
    lineHeight: 20,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },

  // Month Navigation
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },

  navButton: {
    padding: SPACING.xs,
    borderRadius: 8,
  },

  monthYearDisplay: {
    alignItems: 'center',
  },

  monthText: {
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  yearText: {
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  // Year Selection
  yearTabsContainer: {
    marginBottom: SPACING.md,
  },

  yearTabsContent: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.xs,
  },

  yearTab: {
    backgroundColor: COLORS.surfaceVariant,
  },

  selectedYearTab: {
    backgroundColor: COLORS.primary,
  },

  selectedYearTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  unselectedYearTabText: {
    color: COLORS.onSurfaceVariant,
  },

  // Calendar Grid
  calendarGrid: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    elevation: 2,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },

  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },

  dayHeaderText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },

  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
  },

  todayCell: {
    backgroundColor: COLORS.primaryContainer + '30',
    borderRadius: 8,
  },

  dayCellContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },

  dayNumber: {
    color: COLORS.onSurface,
    fontWeight: '500',
  },

  todayNumber: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  eventIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  moreEventsText: {
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    marginLeft: 2,
  },

  // Events List
  eventsList: {
    marginTop: SPACING.md,
  },

  eventsListTitle: {
    marginBottom: SPACING.md,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  emptyEventsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },

  emptyEventsText: {
    marginTop: SPACING.sm,
    color: COLORS.onSurfaceVariant,
  },

  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },

  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  eventCardContent: {
    flex: 1,
  },

  eventTitle: {
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  eventDate: {
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },

  eventTypeChip: {
    height: 28,
  },

  eventDescription: {
    marginTop: SPACING.sm,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },

  // Modal
  modal: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },

  modalTitle: {
    marginBottom: SPACING.lg,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  input: {
    marginBottom: SPACING.md,
  },

  datePickerButton: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 8,
  },

  datePickerLabel: {
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },

  datePickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  datePickerText: {
    color: COLORS.onSurface,
    fontWeight: '500',
  },

  typePickerButton: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 8,
  },

  typePickerLabel: {
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },

  typePickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  typePickerText: {
    flex: 1,
    color: COLORS.onSurface,
    fontWeight: '500',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },

  modalButton: {
    minWidth: 100,
  },
});