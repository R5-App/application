import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Chip, ActivityIndicator, Portal, Modal, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { calendarStyles as styles } from '../styles/screenStyles';
import { COLORS, SPACING } from '../styles/theme';
import apiClient from '../services/api';
import calendarService from '../services/calendarService';
import { visitsService } from '../services/visitsService';
import { Pet } from '../types';
import { CalendarEvent } from '../services/calendarService';
import { SwipeableCard } from '../components/SwipeableCard';

interface Visit {
  id: number;
  pet_id: number;
  visit_date: string;
  location: string;
  vet_name: string;
  type_id: string;
  notes?: string;
  costs?: string;
}

interface DayEvent {
  id: string;
  petId: number;
  title: string;
  description?: string;
  dateTime: string;
  time?: string;
  type: 'event' | 'visit';
  eventType?: string;
  typeName?: string;
  location?: string;
  vetName?: string;
}

const EVENT_TYPE_COLORS = {
  vaccination: COLORS.vaccination,
  veterinary: COLORS.veterinary,
  medication: COLORS.medication,
  grooming: COLORS.grooming,
  other: COLORS.other
};

const DAYS_OF_WEEK = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
const MONTHS = [
  'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
  'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
];

export default function CalendarScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitTypes, setVisitTypes] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  
  // Calendar navigation state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  // Day view modal state
  const [dayViewVisible, setDayViewVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Modal state for adding/editing events
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Form state
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [eventTime, setEventTime] = useState<Date>(new Date());

  // Fetch pets and events from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const petsResponse = await apiClient.get('/api/pets');
        
        if (petsResponse.data.success && petsResponse.data.data) {
          const fetchedPets = petsResponse.data.data;
          setPets(fetchedPets);
          
          // Set the first pet as selected by default
          if (fetchedPets.length > 0) {
            setSelectedPetId(fetchedPets[0].id);
          }
        }
        
        // Try to fetch events from API
        try {
          const fetchedEvents = await calendarService.getAllEvents();
          setEvents(fetchedEvents);
        } catch (eventsError) {
          setEvents([]);
        }

        // Fetch visits
        try {
          const fetchedVisits = await visitsService.getAllVisits();
          setVisits(fetchedVisits);
        } catch (visitsError) {
          console.error('Failed to fetch visits:', visitsError);
          setVisits([]);
        }

        // Fetch visit types
        try {
          const types = await visitsService.getVisitTypes();
          setVisitTypes(types);
        } catch (typesError) {
          console.error('Failed to fetch visit types:', typesError);
          setVisitTypes([]);
        }
        
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Tietojen lataus epäonnistui. Yritä uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get available years from events
  const availableYears = Array.from(
    new Set([
      currentDate.getFullYear() - 1,
      currentDate.getFullYear(),
      currentDate.getFullYear() + 1,
      ...events
        .filter(event => event.date)
        .map(event => {
          const [y] = event.date.substring(0, 10).split('-').map(Number);
          return y;
        })
    ])
  ).sort((a, b) => a - b);

  // Filter events for selected pet, month, and year
  const filteredEvents = events.filter(event => {
    if (event.petId !== selectedPetId) return false;
    if (!event.date) return false;
    const dateStr = event.date.substring(0, 10); // Ensure YYYY-MM-DD format
    const [y, m] = dateStr.split('-').map(Number);
    return (m - 1) === selectedMonth && y === selectedYear;
  });

  // Get days in the current month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    // Convert to Monday = 0, Sunday = 6
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Check if a day has events or visits
  const getEventsForDay = (day: number) => {
    const dayEvents = filteredEvents.filter(event => {
      const dateStr = event.date.substring(0, 10); // Ensure YYYY-MM-DD
      const d = parseInt(dateStr.substring(8, 10), 10);
      return d === day;
    });

    const dayVisits = visits.filter(visit => {
      if (visit.pet_id !== selectedPetId) return false;
      const dateStr = visit.visit_date.substring(0, 10);
      const [vy, vm, vd] = dateStr.split('-').map(Number);
      return vd === day && (vm - 1) === selectedMonth && vy === selectedYear;
    });

    return [...dayEvents, ...dayVisits];
  };

  // Format date as YYYY-MM-DD in local time (avoiding timezone issues)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get all day events (events + visits) for a specific date
  const getDayEvents = (date: Date): DayEvent[] => {
    const dayStr = formatLocalDate(date);
    const dayEvents: DayEvent[] = [];

    // Add calendar events
    filteredEvents.forEach(event => {
      const eventDateStr = event.date.substring(0, 10); // Ensure YYYY-MM-DD
      if (eventDateStr === dayStr) {
        dayEvents.push({
          id: `event-${event.id}`,
          petId: event.petId,
          title: event.title,
          description: event.description,
          dateTime: event.date,
          time: event.time,
          type: 'event',
          eventType: event.eventType,
          typeName: event.typeName,
        });
      }
    });

    // Add visits
    visits.forEach(visit => {
      if (visit.pet_id === selectedPetId && visit.visit_date.startsWith(dayStr)) {
        const visitType = visitTypes.find(t => t.id === parseInt(visit.type_id));
        dayEvents.push({
          id: `visit-${visit.id}`,
          petId: visit.pet_id,
          title: visitType?.name || 'Eläinlääkärissä',
          description: visit.notes,
          dateTime: visit.visit_date,
          type: 'visit',
          location: visit.location,
          vetName: visit.vet_name,
        });
      }
    });

    return dayEvents.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  };

  // Check if day is today
  const isToday = (day: number) => {
    return day === currentDate.getDate() && 
           selectedMonth === currentDate.getMonth() && 
           selectedYear === currentDate.getFullYear();
  };

  // Modal handlers
  const handleOpenModal = (date?: Date) => {
    setIsEditMode(false);
    setEditingEventId(null);
    setEventTitle('');
    setEventDescription('');
    const newDate = date || new Date();
    setEventDate(newDate);
    setEventTime(newDate);
    setSelectedTypeId(visitTypes.length > 0 ? visitTypes[0].id : null);
    setModalVisible(true);
  };

  const handleEditEvent = (event: DayEvent) => {
    if (event.type === 'visit') return; // Can't edit visits from calendar
    
    setIsEditMode(true);
    setEditingEventId(parseInt(event.id.replace('event-', '')));
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    const eventDateTime = new Date(event.dateTime);
    setEventDate(eventDateTime);
    setEventTime(eventDateTime);
    setSelectedTypeId(visitTypes.find(t => t.name.toLowerCase() === event.eventType)?.id || null);
    setDayViewVisible(false);
    setModalVisible(true);
  };

  const handleDeleteEvent = async (event: DayEvent) => {
    if (event.type === 'visit') {
      alert('Käyntejä ei voi poistaa kalenterista. Poista ne käynnit-näkymästä.');
      return;
    }

    try {
      const eventId = parseInt(event.id.replace('event-', ''));
      await calendarService.deleteEvent(eventId);
      const refreshedEvents = await calendarService.getAllEvents();
      setEvents(refreshedEvents);
    } catch (error) {
      console.error('Failed to delete event:', error);
      // Fallback: remove from local state
      setEvents(events.filter(e => e.id !== parseInt(event.id.replace('event-', ''))));
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditMode(false);
    setEditingEventId(null);
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim()) {
      alert('Anna tapahtumalle otsikko');
      return;
    }

    if (!selectedPetId) {
      alert('Valitse lemmikki ensin');
      return;
    }

    if (!selectedTypeId) {
      alert('Valitse tapahtuman tyyppi');
      return;
    }

    try {
      setSaving(true);

      // Format date as YYYY-MM-DD and time as HH:MM:SS
      const dateStr = formatLocalDate(eventDate);
      const hours = String(eventTime.getHours()).padStart(2, '0');
      const minutes = String(eventTime.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:00`;

      const eventData = {
        pet_id: selectedPetId,
        type_id: selectedTypeId!,
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        date: dateStr,
        time: timeStr,
      };

      if (isEditMode && editingEventId) {
        // Update existing event
        const { pet_id, ...updateData } = eventData;
        await calendarService.updateEvent(editingEventId, updateData);
        const refreshedEvents = await calendarService.getAllEvents();
        setEvents(refreshedEvents);
      } else {
        // Create new event
        await calendarService.createEvent(eventData);
        const refreshedEvents = await calendarService.getAllEvents();
        setEvents(refreshedEvents);
      }
      
      handleCloseModal();
    } catch (err: any) {
      console.error('Failed to save event:', err);
      alert('Tapahtuman tallennus epäonnistui');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEventTime(selectedTime);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vaccination: 'Rokotus',
      veterinary: 'Eläinlääkäri',
      medication: 'Lääkitys',
      grooming: 'Trimmaus',
      eläinlääkäri: 'Eläinlääkäri',
      rokotus: 'Rokotus',
      lääkitys: 'Lääkitys',
      trimmaus: 'Trimmaus',
      other: 'Muu',
    };
    // Try exact match, then lowercase, then return the raw type name capitalized
    return labels[type] || labels[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Render day view with event cards
  const renderDayView = () => {
    if (!selectedDate) return null;

    const dayEvents = getDayEvents(selectedDate);
    
    // Separate events with and without time
    const allDayEvents = dayEvents.filter(event => !event.time);
    const timedEvents = dayEvents.filter(event => !!event.time)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const renderEventCard = (event: DayEvent) => {
      const eventTypeKey = event.eventType?.toLowerCase() || 'other';
      const borderColor = event.type === 'visit' 
        ? COLORS.primary 
        : (EVENT_TYPE_COLORS[eventTypeKey] || EVENT_TYPE_COLORS['other']);

      const cardContent = (
        <View 
          style={[
            styles.dayViewEventCard,
            { borderLeftWidth: 4, borderLeftColor: borderColor }
          ]}
        >
          <Text variant="titleMedium" style={styles.eventCardTitle}>
            {event.title}
          </Text>
          {event.type === 'event' && (event.time || event.description || event.eventType) && (
            <View style={styles.visitCardDetails}>
              {event.time && (
                <View style={styles.visitDetailRow}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.visitCardDetailText}>
                    {event.time.substring(0, 5)}
                  </Text>
                </View>
              )}
              {event.description && (
                <View style={styles.visitDetailRow}>
                  <MaterialCommunityIcons name="text-short" size={16} color={COLORS.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.visitCardDetailText}>
                    {event.description}
                  </Text>
                </View>
              )}
              {event.eventType && (
                <View style={styles.visitDetailRow}>
                  <MaterialCommunityIcons name="tag-outline" size={16} color={COLORS.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.visitCardDetailText}>
                    {getEventTypeLabel(event.eventType)}
                  </Text>
                </View>
              )}
            </View>
          )}
          {event.type === 'visit' && (
            <View style={styles.visitCardDetails}>
              {event.location && (
                <View style={styles.visitDetailRow}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.visitCardDetailText}>
                    {event.location}
                  </Text>
                </View>
              )}
              {event.vetName && (
                <View style={styles.visitDetailRow}>
                  <MaterialCommunityIcons name="doctor" size={16} color={COLORS.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.visitCardDetailText}>
                    {event.vetName}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      );

      // Wrap in SwipeableCard only for calendar events, not visits
      if (event.type === 'visit') {
        return <View key={event.id}>{cardContent}</View>;
      }

      return (
        <SwipeableCard
          key={event.id}
          onEdit={() => handleEditEvent(event)}
          onDelete={() => handleDeleteEvent(event)}
        >
          {cardContent}
        </SwipeableCard>
      );
    };

    return (
      <View style={styles.dayViewContainer}>
        <View style={styles.dayViewHeader}>
          <Text variant="headlineSmall" style={styles.dayViewTitle}>
            {selectedDate.getDate()}. {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => setDayViewVisible(false)}>
            <MaterialCommunityIcons name="close" size={28} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.dayViewScroll} contentContainerStyle={styles.dayViewScrollContent}>
          {/* All-day events section */}
          {allDayEvents.length > 0 && (
            <View style={styles.allDaySection}>
              <Text variant="labelLarge" style={styles.daySectionTitle}>
                Koko päivän tapahtumat
              </Text>
              {allDayEvents.map(renderEventCard)}
            </View>
          )}

          {/* Timed events section */}
          {timedEvents.length > 0 && (
            <View style={styles.timedSection}>
              <Text variant="labelLarge" style={styles.daySectionTitle}>
                Ajastetut tapahtumat
              </Text>
              {timedEvents.map(renderEventCard)}
            </View>
          )}

          {/* Empty state */}
          {dayEvents.length === 0 && (
            <View style={styles.emptyDayView}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color={COLORS.onSurfaceVariant} />
              <Text variant="bodyLarge" style={styles.emptyDayText}>
                Ei tapahtumia tänä päivänä
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Add Event Button */}
        <View style={styles.dayViewFooter}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => {
              setDayViewVisible(false);
              handleOpenModal(selectedDate);
            }}
            style={styles.addEventButton}
          >
            Lisää tapahtuma
          </Button>
        </View>
      </View>
    );
  };

  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <View style={styles.calendarGrid}>
        {/* Day headers */}
        <View style={styles.weekRow}>
          {DAYS_OF_WEEK.map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text variant="labelSmall" style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        <View style={styles.daysContainer}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const dayEvents = getEventsForDay(day);
            const today = isToday(day);

            return (
              <TouchableOpacity 
                key={`day-${day}`} 
                style={[
                  styles.dayCell,
                  today && styles.todayCell
                ]}
                onPress={() => {
                  const clickedDate = new Date(selectedYear, selectedMonth, day);
                  setSelectedDate(clickedDate);
                  setDayViewVisible(true);
                }}
              >
                <View style={styles.dayCellContent}>
                  <Text 
                    variant="bodyMedium" 
                    style={[
                      styles.dayNumber,
                      today && styles.todayNumber
                    ]}
                  >
                    {day}
                  </Text>
                  {dayEvents.length > 0 && (
                    <View style={styles.eventIndicators}>
                      {dayEvents.slice(0, 3).map((event, idx) => {
                        const isCalendarEvent = 'eventType' in event;
                        let color = COLORS.primary;
                        if (isCalendarEvent && event.eventType) {
                          const typeKey = event.eventType.toLowerCase();
                          color = EVENT_TYPE_COLORS[typeKey] || EVENT_TYPE_COLORS['other'];
                        }
                        return (
                          <View
                            key={`indicator-${idx}`}
                            style={[
                              styles.eventDot,
                              { backgroundColor: color }
                            ]}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };


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

  return (
    <View style={styles.container}>
      {/* Pet Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
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
                color={selectedPetId === pet.id ? COLORS.onPrimary : COLORS.onSurfaceVariant} 
              />
            )}
          >
            {pet.name}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.primary} />
          </TouchableOpacity>
          
          <View style={styles.monthYearDisplay}>
            <Text variant="headlineSmall" style={styles.monthText}>
              {MONTHS[selectedMonth]}
            </Text>
            <Text variant="titleMedium" style={styles.yearText}>
              {selectedYear}
            </Text>
          </View>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <MaterialCommunityIcons name="chevron-right" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Year Selection */}
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

        {/* Calendar Grid */}
        {renderCalendar()}

      </ScrollView>

      {/* Day View Modal */}
      <Portal>
        <Modal
          visible={dayViewVisible}
          onDismiss={() => setDayViewVisible(false)}
          contentContainerStyle={styles.dayViewModal}
        >
          {renderDayView()}
        </Modal>
      </Portal>

      {/* Add Event Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={handleCloseModal}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {isEditMode ? 'Muokkaa tapahtumaa' : 'Lisää tapahtuma'}
            </Text>

            <TextInput
              label="Otsikko *"
              value={eventTitle}
              onChangeText={setEventTitle}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Kuvaus"
              value={eventDescription}
              onChangeText={setEventDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Päivämäärä"
                value={eventDate ? eventDate.toLocaleDateString('fi-FI') : ''}
                style={styles.input}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                placeholder="PP-KK-VVVV"
                placeholderTextColor={COLORS.placeholderText}
                textColor={COLORS.onSurface}
                theme={{ colors: { onSurfaceVariant: COLORS.onSurfaceVariant } }}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={eventDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <TextInput
                label="Aika"
                value={eventTime ? eventTime.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) : ''}
                style={styles.input}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="clock-outline" />}
                placeholder="HH:MM"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                textColor={COLORS.onSurface}
                theme={{ colors: { onSurfaceVariant: 'rgba(0, 0, 0, 0.4)' } }}
              />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={eventTime || new Date()}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <View style={styles.input}>
              <Text variant="bodyMedium" style={styles.typePickerLabel}>
                Tapahtuman tyyppi
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', paddingVertical: SPACING.sm }}
              >
                {visitTypes.length > 0 ? (
                  visitTypes.map((type) => (
                    <Button
                      key={type.id}
                      mode={selectedTypeId === type.id ? 'contained' : 'outlined'}
                      onPress={() => setSelectedTypeId(type.id)}
                      style={{
                        marginRight: SPACING.sm,
                        borderColor: COLORS.primary,
                        backgroundColor: selectedTypeId === type.id ? COLORS.primary : COLORS.surface,
                        minWidth: 100,
                        borderRadius: 20,
                        elevation: selectedTypeId === type.id ? 2 : 0,
                      }}
                      labelStyle={{
                        color: selectedTypeId === type.id ? COLORS.onPrimary : COLORS.primary,
                        fontWeight: selectedTypeId === type.id ? 'bold' : 'normal',
                        textTransform: 'none',
                      }}
                    >
                      {type.name}
                    </Button>
                  ))
                ) : (
                  <Button disabled mode="outlined">Ladataan...</Button>
                )}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
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
                onPress={handleSaveEvent}
                style={styles.modalButton}
                loading={saving}
                disabled={saving}
              >
                Tallenna
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}
