// Calendar service for managing calendar events
import apiClient from './api';

export interface CalendarEvent {
  id: number;
  petId: number;
  title: string;
  description?: string;
  date: string;
  eventType: 'vaccination' | 'veterinary' | 'medication' | 'grooming' | 'other';
  completed: boolean;
  notificationEnabled?: boolean;
  notificationTime?: string; // Time before event to notify (e.g., '1 day', '1 hour')
}

export interface CreateCalendarEventData {
  pet_id: number;
  title: string;
  description?: string;
  date: string;
  event_type?: CalendarEvent['eventType'];
  visit_type_id?: number;
  completed?: boolean;
  notification_enabled?: boolean;
  notification_time?: string;
}

export interface UpdateCalendarEventData {
  pet_id?: number;
  title?: string;
  description?: string;
  date?: string;
  event_type?: CalendarEvent['eventType'];
  completed?: boolean;
  notification_enabled?: boolean;
  notification_time?: string;
}

export const calendarService = {
  /**
   * Get all calendar events
   */
  async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await apiClient.get('/api/calendar-events');
      
      if (response.data.success && response.data.data) {
        return response.data.data.map((event: any) => ({
          id: event.id,
          petId: event.pet_id,
          title: event.title,
          description: event.description,
          date: event.date,
          eventType: event.event_type,
          completed: event.completed || false,
          notificationEnabled: event.notification_enabled,
          notificationTime: event.notification_time,
        }));
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
        return response.data.data.map((event: any) => ({
          id: event.id,
          petId: event.pet_id,
          title: event.title,
          description: event.description,
          date: event.date,
          eventType: event.event_type,
          completed: event.completed || false,
          notificationEnabled: event.notification_enabled,
          notificationTime: event.notification_time,
        }));
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
        const event = response.data.data;
        return {
          id: event.id,
          petId: event.pet_id,
          title: event.title,
          description: event.description,
          date: event.date,
          eventType: event.event_type,
          completed: event.completed || false,
          notificationEnabled: event.notification_enabled,
          notificationTime: event.notification_time,
        };
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
        const event = response.data.data;
        return {
          id: event.id,
          petId: event.pet_id,
          title: event.title,
          description: event.description,
          date: event.date,
          eventType: event.event_type,
          completed: event.completed || false,
          notificationEnabled: event.notification_enabled,
          notificationTime: event.notification_time,
        };
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
        const event = response.data.data;
        return {
          id: event.id,
          petId: event.pet_id,
          title: event.title,
          description: event.description,
          date: event.date,
          eventType: event.event_type,
          completed: event.completed || false,
          notificationEnabled: event.notification_enabled,
          notificationTime: event.notification_time,
        };
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
   * Mark an event as completed
   */
  async markEventCompleted(eventId: number): Promise<CalendarEvent | null> {
    return this.updateEvent(eventId, { completed: true });
  },

  /**
   * Mark an event as incomplete
   */
  async markEventIncomplete(eventId: number): Promise<CalendarEvent | null> {
    return this.updateEvent(eventId, { completed: false });
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
        .filter(event => new Date(event.date) >= today && !event.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error: any) {
      console.error('Failed to fetch upcoming events:', error);
      throw error;
    }
  },
};

export default calendarService;
