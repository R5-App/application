import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Text, Card, FAB, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Line, Circle } from 'react-native-svg';
import { COLORS, SPACING } from '../styles/theme';

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
}

interface WeightRecord {
  id: string;
  petId: string;
  date: string;
  weight: number;
  unit: 'kg' | 'g';
  notes?: string;
  measuredBy?: string;
}

export default function WeightManagementScreen() {
  // Mock data - replace with actual data from context/API
  const [pets] = useState<Pet[]>([]);

  const [weightRecords] = useState<WeightRecord[]>([]);

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const selectedPetWeights = weightRecords
    .filter(record => record.petId === selectedPetId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get unique years from selected pet's weights
  const availableYears = Array.from(
    new Set(selectedPetWeights.map(record => new Date(record.date).getFullYear()))
  ).sort((a, b) => a - b);

  // Filter weights by selected year for graph
  const yearFilteredWeights = selectedPetWeights.filter(
    record => new Date(record.date).getFullYear() === selectedYear
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateWeightChange = (index: number) => {
    if (index >= selectedPetWeights.length - 1) return null;
    
    const current = selectedPetWeights[index].weight;
    const previous = selectedPetWeights[index + 1].weight;
    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);
    
    return { change: change.toFixed(1), percentChange, isIncrease: change > 0 };
  };

  const renderWeightCard = (record: WeightRecord, index: number) => {
    const weightChange = calculateWeightChange(index);
    
    return (
      <Card key={record.id} style={styles.weightCard}>
        <Card.Content>
          <View style={styles.weightHeader}>
            <View style={styles.weightMainInfo}>
              <Text variant="displaySmall" style={styles.weightValue}>
                {record.weight}
              </Text>
              <Text variant="titleLarge" style={styles.weightUnit}>
                {record.unit}
              </Text>
            </View>
            {weightChange && (
              <Chip
                icon={weightChange.isIncrease ? 'arrow-up' : 'arrow-down'}
                compact
                style={[
                  styles.changeChip,
                  weightChange.isIncrease ? styles.increaseChip : styles.decreaseChip
                ]}
                textStyle={
                  weightChange.isIncrease ? styles.increaseChipText : styles.decreaseChipText
                }
              >
                {weightChange.isIncrease ? '+' : ''}{weightChange.change} kg ({weightChange.percentChange}%)
              </Chip>
            )}
          </View>

          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar" size={18} color={COLORS.onSurfaceVariant} />
            <Text variant="bodyMedium" style={styles.dateText}>
              {formatDate(record.date)}
            </Text>
          </View>

          {record.measuredBy && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.weightDetail}>
                <MaterialCommunityIcons name="account" size={18} color={COLORS.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {record.measuredBy}
                </Text>
              </View>
            </>
          )}

          {record.notes && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons name="note-text" size={18} color={COLORS.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.notesText}>
                  {record.notes}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="scale-bathroom" size={64} color={COLORS.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        Ei painomittauksia
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Lisää ensimmäinen painomittaus
      </Text>
    </View>
  );

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="paw-off" size={64} color={COLORS.onSurfaceVariant} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Ei lemmikkejä
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Lisää ensin lemmikki
          </Text>
        </View>
      </View>
    );
  }

  const renderGraph = () => {
    if (yearFilteredWeights.length === 0) return null;

    // Group weights by month and calculate averages
    const monthlyAverages = new Map<string, { weights: number[], dates: string[] }>();
    
    yearFilteredWeights.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // e.g., "2025-0" for Jan 2025
      
      if (!monthlyAverages.has(monthKey)) {
        monthlyAverages.set(monthKey, { weights: [], dates: [] });
      }
      
      const monthData = monthlyAverages.get(monthKey)!;
      monthData.weights.push(record.weight);
      monthData.dates.push(record.date);
    });
    
    // Create averaged weight records (one per month)
    const averagedWeights = Array.from(monthlyAverages.entries()).map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const avgWeight = data.weights.reduce((sum, w) => sum + w, 0) / data.weights.length;
      
      return {
        id: monthKey,
        date: new Date(year, month, 15), // Use middle of month
        weight: avgWeight,
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Get sorted weights (oldest to newest for graph)
    const sortedWeights = averagedWeights;
    const weights = sortedWeights.map(r => r.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const weightRange = maxWeight - minWeight || 1;
    // Add 10% padding to top and bottom for better visibility
    const paddedMax = maxWeight + (weightRange * 0.1);
    const paddedMin = minWeight - (weightRange * 0.1);
    const paddedRange = paddedMax - paddedMin;
    const svgHeight = 220;
    // Make graph slightly wider for better readability
    const screenWidth = Dimensions.get('window').width;
    const svgWidth = (screenWidth * 1.5) - 120; // 1.5x width for horizontal scrolling
    // Add horizontal margins
    const marginX = 20;

    // Round y-axis labels to nice 5kg intervals
    const roundToNice = (num: number, roundUp: boolean) => {
      if (roundUp) {
        return Math.ceil(num / 5) * 5;
      } else {
        return Math.floor(num / 5) * 5;
      }
    };

    // Round the padded values to get nice labels at 5kg intervals
    let maxLabel = roundToNice(paddedMax, true);
    let minLabel = roundToNice(paddedMin, false);
    
    // Ensure we have at least 10kg range for 3 labels (min, mid, max)
    if (maxLabel - minLabel < 10) {
      maxLabel = minLabel + 10;
    }
    
    // Calculate proper middle value - halfway between min and max
    const midLabel = (minLabel + maxLabel) / 2;

    // Setup time range for entire year (Jan 1 to Dec 31 of selected year)
    const timeStart = new Date(selectedYear, 0, 1); // Jan 1
    const timeEnd = new Date(selectedYear, 11, 31, 23, 59, 59); // Dec 31
    const timeRange = timeEnd.getTime() - timeStart.getTime();
    
    // Month labels - first letter of each Finnish month
    const monthLabels = ['T', 'H', 'M', 'H', 'T', 'K', 'H', 'E', 'S', 'L', 'M', 'J'];
    
    // Create x-axis labels for all 12 months
    const xAxisLabels = monthLabels.map((label, idx) => {
      // Position at middle of each month
      const monthDate = new Date(selectedYear, idx, 15); // 15th of each month
      return { date: monthDate, label };
    });

    return (
      <View style={styles.graphContainer}>
        <Text variant="titleMedium" style={styles.graphTitle}>
          Painokehitys
        </Text>
        <View style={styles.graphContent}>
          <View style={styles.yAxisContainer}>
            <View style={styles.yAxisLabels}>
              <Text variant="bodySmall" style={styles.axisLabel}>{maxLabel}</Text>
              <View style={styles.yAxisMiddle}>
                <Text variant="bodySmall" style={styles.axisTitle}>kg</Text>
                <Text variant="bodySmall" style={styles.axisLabel}>{midLabel}</Text>
              </View>
              <Text variant="bodySmall" style={styles.axisLabel}>{minLabel}</Text>
            </View>
          </View>
          <View style={styles.graphArea}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={styles.graphScrollView}
            >
              <View>
                <Svg height={svgHeight} width={svgWidth} style={styles.svgGraph}>
                  {/* Draw horizontal grid lines at label positions */}
                  <Line
                    x1={0}
                    y1={0}
                    x2={svgWidth}
                    y2={0}
                    stroke="#E0E0E0"
                    strokeWidth="1"
                  />
                  <Line
                    x1={0}
                    y1={svgHeight / 2}
                    x2={svgWidth}
                    y2={svgHeight / 2}
                    stroke="#E0E0E0"
                    strokeWidth="1"
                  />
                  <Line
                    x1={0}
                    y1={svgHeight}
                    x2={svgWidth}
                    y2={svgHeight}
                    stroke="#E0E0E0"
                    strokeWidth="1"
                  />
                  
                  {/* Draw vertical month divider lines */}
                  {[...Array(11)].map((_, idx) => {
                    const monthEndDate = new Date(selectedYear, idx + 1, 1); // First day of next month
                    const x = marginX + ((monthEndDate.getTime() - timeStart.getTime()) / timeRange) * (svgWidth - 2 * marginX);
                    return (
                      <Line
                        key={`month-line-${idx}`}
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={svgHeight}
                        stroke="#E0E0E0"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                    );
                  })}
                  
                  {/* Draw lines connecting points */}
                  {sortedWeights.map((record, index) => {
                    if (index >= sortedWeights.length - 1) return null;
                    
                    const nextRecord = sortedWeights[index + 1];
                    const recordTime = record.date.getTime();
                    const nextRecordTime = nextRecord.date.getTime();
                    
                    const x1 = marginX + ((recordTime - timeStart.getTime()) / timeRange) * (svgWidth - 2 * marginX);
                    const x2 = marginX + ((nextRecordTime - timeStart.getTime()) / timeRange) * (svgWidth - 2 * marginX);
                    // Use label values for positioning to match grid lines
                    const y1 = svgHeight - ((record.weight - minLabel) / (maxLabel - minLabel)) * svgHeight;
                    const y2 = svgHeight - ((nextRecord.weight - minLabel) / (maxLabel - minLabel)) * svgHeight;
                    
                    return (
                      <Line
                        key={`line-${record.id}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={COLORS.primary}
                        strokeWidth="3"
                      />
                    );
                  })}
                  
                  {/* Draw data point circles */}
                  {sortedWeights.map((record) => {
                    const recordTime = record.date.getTime();
                    const x = marginX + ((recordTime - timeStart.getTime()) / timeRange) * (svgWidth - 2 * marginX);
                    // Use label values for positioning to match grid lines
                    const y = svgHeight - ((record.weight - minLabel) / (maxLabel - minLabel)) * svgHeight;
                    
                    return (
                      <React.Fragment key={`dot-${record.id}`}>
                        {/* White fill to hide line inside circle */}
                        <Circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#FFFFFF"
                        />
                        {/* Colored stroke circle */}
                        <Circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="none"
                          stroke={COLORS.primary}
                          strokeWidth="2.5"
                        />
                      </React.Fragment>
                    );
                  })}
                </Svg>
                <View style={[styles.xAxisLabelsContainer, { width: svgWidth }]}>
                  {xAxisLabels.map((label, idx) => {
                    const labelTime = label.date.getTime();
                    const xPos = marginX + ((labelTime - timeStart.getTime()) / timeRange) * (svgWidth - 2 * marginX);
                    
                    return (
                      <Text 
                        key={`label-${idx}`} 
                        variant="bodySmall" 
                        style={[styles.xAxisLabelShown, { position: 'absolute', left: xPos, transform: [{ translateX: -5 }] }]}
                      >
                        {label.label}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            <Text variant="bodySmall" style={styles.xAxisTitle}>pvm</Text>
          </View>
        </View>
        
        {/* Year selection tabs */}
        {availableYears.length > 1 && (
          <View style={styles.yearTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.yearTabsContent}
            >
              {availableYears.map((year) => (
                <Chip
                  key={year}
                  selected={selectedYear === year}
                  onPress={() => setSelectedYear(year)}
                  showSelectedCheck={false}
                  style={[
                    styles.yearTab,
                    selectedYear === year && styles.selectedYearTab
                  ]}
                  textStyle={selectedYear === year ? styles.selectedYearTabText : styles.unselectedYearTabText}
                >
                  {year}
                </Chip>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              selected={selectedPetId === pet.id}
              onPress={() => setSelectedPetId(pet.id)}
              style={[
                styles.tab,
                selectedPetId === pet.id && styles.selectedTab
              ]}
              textStyle={selectedPetId === pet.id ? styles.selectedTabText : styles.unselectedTabText}
              icon={() => (
                <MaterialCommunityIcons 
                  name="paw" 
                  size={18} 
                  color={selectedPetId === pet.id ? '#FFFFFF' : COLORS.onSurfaceVariant} 
                />
              )}
            >
              {pet.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedPetWeights.length > 0 && renderGraph()}

        <View style={styles.dividerSection}>
          <Divider />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Mittaushistoria
          </Text>
        </View>

        {selectedPetWeights.length === 0 ? (
          renderEmptyState()
        ) : (
          selectedPetWeights.map((record, index) => renderWeightCard(record, index))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Lisää painomittaus')}
        label="Lisää mittaus"
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
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
  notesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  notesText: {
    flex: 1,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
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
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  graphScrollView: {
    width: '100%',
  },
});
