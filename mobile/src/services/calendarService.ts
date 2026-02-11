// Calendar service for managing calendar events
import apiClient from './api';

export interface CalendarEvent {
  id: number;
  petId: number;
  title: string;
  description?: string;
  date: string; // "YYYY-MM-DD" extracted from ISO
  time?: string; // "HH:MM:SS"
  typeId?: number;
  typeName?: string;
  eventType: string;
  remindBeforeMin?: number;
}

// Helper to map a raw event object to CalendarEvent
const mapEvent = (event: any, petId?: number): CalendarEvent => ({
  id: event.id,
  petId: petId ?? event.pet_id,
  title: event.title,
  description: event.description,
  date: event.date ? event.date.substring(0, 10) : '',
  time: event.time,
  typeId: event.type_id,
  typeName: event.type_name,
  eventType: event.type_name || event.event_type || 'other',
  remindBeforeMin: event.remind_before_min,
});

export interface CreateCalendarEventData {
  pet_id: number;
  type_id: number;
  title: string;
  description?: string;
  date: string;
  time?: string; // Format: "HH:MM:SS"
  remind_before_min?: number;
}

export interface UpdateCalendarEventData {
  type_id?: number;
  title?: string;
  description?: string;
  date?: string;
  time?: string; // Format: "HH:MM:SS"
  remind_before_min?: number;
}

export const calendarService = {
  /**
   * Get all calendar events
   */
  async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await apiClient.get('/api/calendar-events');
      
      if (response.data.success && response.data.data) {
        // Response is grouped by pet: [{pet_id, pet_name, calendar_events: [...]}]
        const allEvents: CalendarEvent[] = [];
        for (const petGroup of response.data.data) {
          if (petGroup.calendar_events && Array.isArray(petGroup.calendar_events)) {
            for (const event of petGroup.calendar_events) {
              allEvents.push(mapEvent(event, petGroup.pet_id));
            }
          }
        }
        return allEvents;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch calendar events:', error);
      throw error;
    }
  },

  /**
   * Get events for a specific pet
   */
  async getEventsByPetId(petId: number): Promise<CalendarEvent[]> {
    try {
      const response = await apiClient.get(`/api/calendar-events/pet/${petId}`);
      
      if (response.data.success && response.data.data) {
        // May be flat array or nested — handle both
        const raw = response.data.data;
        if (Array.isArray(raw) && raw.length > 0 && raw[0].calendar_events) {
          // Nested by pet
          const allEvents: CalendarEvent[] = [];
          for (const petGroup of raw) {
            if (petGroup.calendar_events && Array.isArray(petGroup.calendar_events)) {
              for (const event of petGroup.calendar_events) {
                allEvents.push(mapEvent(event, petGroup.pet_id));
              }
            }
          }
          return allEvents;
        }
        // Flat array of events
        return raw.filter((e: any) => e.date).map((event: any) => mapEvent(event, petId));
      }
      
      return [];
    } catch (error: any) {
      console.error(`Failed to fetch events for pet ${petId}:`, error);
      throw error;
    }
  },

  /**
   * Get a single event by ID
   */
  async getEventById(eventId: number): Promise<CalendarEvent | null> {
    try {
      const response = await apiClient.get(`/api/calendar-events/${eventId}`);
      
      if (response.data.success && response.data.data) {
        return mapEvent(response.data.data);
      }
      
      return null;
    } catch (error: any) {
      console.error(`Failed to fetch event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: CreateCalendarEventData): Promise<CalendarEvent | null> {
    try {
      const response = await apiClient.post('/api/calendar-events', eventData);
      
      if (response.data.success && response.data.data) {
        return mapEvent(response.data.data);
      }
      
      return null;
    } catch (error: any) {
      console.error('Failed to create event:', error);
      throw error;
    }
  },

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: number, eventData: UpdateCalendarEventData): Promise<CalendarEvent | null> {
    try {
      const response = await apiClient.put(`/api/calendar-events/${eventId}`, eventData);
      
      if (response.data.success && response.data.data) {
        return mapEvent(response.data.data);
      }
      
      return null;
    } catch (error: any) {
      console.error(`Failed to update event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: number): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/api/calendar-events/${eventId}`);
      return response.data.success;
    } catch (error: any) {
      console.error(`Failed to delete event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Get upcoming events (events in the future)
   */
  async getUpcomingEvents(petId?: number): Promise<CalendarEvent[]> {
    try {
      const events = petId 
        ? await this.getEventsByPetId(petId)
        : await this.getAllEvents();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return events
        .filter(event => event.date >= today.toISOString().substring(0, 10))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error: any) {
      console.error('Failed to fetch upcoming events:', error);
      throw error;
    }
  },
};

export default calendarService;
