import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, Chip, Divider, ActivityIndicator, Portal, Modal, Button, TextInput, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Line, Circle } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { weightsStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import { weightsService } from '../services/weightsService';
import { Pet } from '../types';
import { SwipeableCard } from '../components/SwipeableCard';

interface WeightRecord {
  id: number;
  petId: number;
  date: string;
  weight: number;
  created_at: string;
  notes?: string;
  measuredBy?: string;
}

export default function WeightManagementScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [editingWeightId, setEditingWeightId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [weightToDelete, setWeightToDelete] = useState<WeightRecord | null>(null);  
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [weight, setWeight] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch pets and weights from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both pets and weights in parallel
        const [petsResponse, fetchedWeights] = await Promise.all([
          apiClient.get('/api/pets'),
          weightsService.getAllWeights()
        ]);
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }

        setWeightRecords(fetchedWeights);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Tietojen lataus epäonnistui. Yritä uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
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

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingWeightId(null);
    setWeight('');
    setDate(new Date().toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingWeightId(null);
  };

  const handleSaveWeight = async () => {
    if (!weight) {
      alert('Täytä kaikki pakolliset kentät');
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && editingWeightId) {

        const weightData = {
          pet_id: selectedPetId,
          weight: parseFloat(weight),
          date: date
        };

        const updatedWeight = await weightsService.updateWeight(editingWeightId, weightData);

        if (updatedWeight) {
          // Refresh weights
          const refreshedWeights = await weightsService.getAllWeights();
          setWeightRecords(refreshedWeights);

          handleCloseModal();
        }
      } else {
        if (!selectedPetId) {
          alert('Valitse lemmikki ennen tallentamista.');
          return;
        }
      
        const weightData = {
          pet_id: selectedPetId,
          weight: parseFloat(weight),
          date: date
        };

        const newWeight = await weightsService.createWeight(weightData);

        if (newWeight) {
          // Refresh weights
          const refreshedWeights = await weightsService.getAllWeights();
          setWeightRecords(refreshedWeights);
          
          handleCloseModal();
        }
      }
    } catch (err: any) {
      alert('Painon tallentaminen epäonnistui. Yritä uudelleen.');
    } finally {
      setSaving(false);
    }
  };

    const handleEditWeightRecord = (weightRecord: WeightRecord) => {
      setIsEditMode(true);
      setEditingWeightId(weightRecord.id);

      // Pre-fill form with weight data
      const dateOnly = weightRecord.date.split('T')[0];
      setWeight(weightRecord.weight.toString());
      setDate(dateOnly);
      setModalVisible(true);
  };

  const handleDeleteWeightRecord = async (weightRecord: WeightRecord) => {
    setWeightToDelete(weightRecord);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteWeightRecord = async () => {   
    if (!weightToDelete) return;

    try {
      const success = await weightsService.deleteWeight(weightToDelete.id);

      if (success) {
        // Refresh weights
        const refreshedWeights = await weightsService.getAllWeights();
        setWeightRecords(refreshedWeights);
        setDeleteDialogVisible(false);
        setWeightToDelete(null);
      } else {
        alert('Painomittauksen poistaminen epäonnistui. Yritä uudelleen.');
      }
    } catch (err: any) {
      console.error("Failed to delete weight record:", err);
      alert('Painomittauksen poistaminen epäonnistui. Yritä uudelleen.');
    }
  };

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

  const formatWeight = (weight: number | undefined): string => {
    if (weight === undefined || weight === null) {
      return '0';
    }
    return weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(2).replace(/\.?0+$/, '');
  };

  const renderWeightCard = (record: WeightRecord, index: number) => {
    const weightChange = calculateWeightChange(index);
    
    return (
      <SwipeableCard
        key={record.id}
        onEdit={() => handleEditWeightRecord(record)}
        onDelete={() => handleDeleteWeightRecord(record)}
      >
        <Card style={styles.weightCard}>
          <Card.Content>
            <View style={styles.weightHeader}>
              <View style={styles.weightMainInfo}>
                <Text variant="displaySmall" style={styles.weightValue}>
                  {formatWeight(record.weight)} kg
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

            <Divider style={styles.divider} />

            <View style={styles.bottomSection}>
              {record.date && (
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons name="calendar" size={18} color={COLORS.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={styles.dateText}>
                    {formatDate(record.date)}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </SwipeableCard>
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text variant="bodyMedium" style={[styles.emptyText, { marginTop: SPACING.md }]}>
            Ladataan lemmikkejä...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={COLORS.error} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Virhe
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

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
        onPress={handleOpenModal}
        label="Lisää mittaus"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleCloseModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContentContainer}
          >
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {isEditMode ? 'Muokkaa painomittausta' : 'Lisää painomittaus'}
            </Text>

            <TextInput
              label="Paino (kg) *"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder=""
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              textColor={COLORS.onSurface}
              theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Päivämäärä *"
                value={new Date(date).toLocaleDateString('fi-FI')}
                style={styles.input}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                placeholder="PP-KK-VVVV"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                textColor={COLORS.onSurface}
                theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(date)}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDate(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCloseModal}
                style={styles.modalButton}
                disabled={saving}
              >
                Peruuta
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveWeight}
                style={styles.modalButton}
                loading={saving}
                disabled={saving}
              >
                Tallenna
              </Button>
            </View>
          </ScrollView>
        </Modal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Poista painomittaus</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Haluatko varmasti poistaa tämän painomittauksen?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Peruuta</Button>
            <Button onPress={confirmDeleteWeightRecord} textColor={COLORS.error}>Poista</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

