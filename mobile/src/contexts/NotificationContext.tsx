/**
 * Notification Context
 * 
 * Tarjoaa ilmoituspalvelun tilan ja toiminnot koko sovellukselle.
 */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import notificationService, {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../services/notificationService';

interface NotificationContextType {
  /** Push-token */
  pushToken: string | null;
  /** Onko ilmoituslupa myönnetty */
  hasPermission: boolean;
  /** Ilmoitusasetukset */
  settings: NotificationSettings;
  /** Päivitä ilmoitusasetukset */
  updateSettings: (settings: NotificationSettings) => Promise<void>;
  /** Pyydä ilmoituslupa */
  requestPermission: () => Promise<boolean>;
  /** Ajasta rokotusmuistutus */
  scheduleVaccinationReminder: (petName: string, vaccineName: string, dueDate: Date, daysBefore?: number) => Promise<string>;
  /** Ajasta lääkitysmuistutus */
  scheduleMedicationReminder: (petName: string, medicationName: string, hour?: number, minute?: number) => Promise<string>;
  /** Ajasta lenkkimuistutus */
  scheduleWalkReminder: (petName: string, hour?: number, minute?: number) => Promise<string>;
  /** Peruuta ilmoitus */
  cancelNotification: (id: string) => Promise<void>;
  /** Peruuta kaikki ilmoitukset */
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Alusta ilmoituspalvelu
  useEffect(() => {
    const init = async () => {
      // Lataa asetukset
      const savedSettings = await notificationService.getSettings();
      setSettings(savedSettings);

      // Tarkista lupa
      const permitted = await notificationService.hasPermission();
      setHasPermission(permitted);

      // Rekisteröi token jos lupa myönnetty ja ilmoitukset päällä
      if (savedSettings.enabled) {
        const token = await notificationService.initialize();
        if (token) {
          setPushToken(token);
          setHasPermission(true);
        }
      }

      // Nollaa badge
      await notificationService.clearBadge();
    };

    init();

    // Kuuntele saapuvia ilmoituksia (sovellus auki)
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Ilmoitus vastaanotettu:', notification.request.content.title);
      }
    );

    // Kuuntele ilmoituksen klikkauksia
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('Ilmoitusta klikattu:', data);
        handleNotificationNavigation(data);
      }
    );

    // Tarkista avattiinko sovellus ilmoituksesta (cold start)
    notificationService.getLastNotificationResponse().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        console.log('Sovellus avattu ilmoituksesta:', data);
        handleNotificationNavigation(data);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Navigoi ilmoituksen perusteella
  const handleNotificationNavigation = (data: Record<string, unknown>) => {
    const type = data?.type as string;
    // Navigointi tapahtuu sovelluksen navigaation kautta
    // Tämä on placeholder - voidaan laajentaa myöhemmin
    switch (type) {
      case 'vaccination':
        console.log('Navigoidaan rokotuksiin');
        break;
      case 'medication':
        console.log('Navigoidaan lääkityksiin');
        break;
      case 'walk':
        console.log('Navigoidaan karttaan');
        break;
      case 'calendar':
        console.log('Navigoidaan kalenteriin');
        break;
      default:
        break;
    }
  };

  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    await notificationService.saveSettings(newSettings);

    // Jos ilmoitukset kytketään pois, peruuta kaikki
    if (!newSettings.enabled) {
      await notificationService.cancelAllNotifications();
    } else if (!pushToken) {
      // Jos ilmoitukset kytketään päälle, rekisteröi token
      const token = await notificationService.initialize();
      if (token) {
        setPushToken(token);
        setHasPermission(true);
      }
    }
  }, [pushToken]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setHasPermission(granted);
    if (granted && !pushToken) {
      const token = await notificationService.initialize();
      if (token) setPushToken(token);
    }
    return granted;
  }, [pushToken]);

  const scheduleVaccinationReminder = useCallback(
    async (petName: string, vaccineName: string, dueDate: Date, daysBefore: number = 7) => {
      if (!settings.enabled || !settings.vaccinationReminders) return '';
      return await notificationService.scheduleVaccinationReminder(petName, vaccineName, dueDate, daysBefore);
    },
    [settings]
  );

  const scheduleMedicationReminder = useCallback(
    async (petName: string, medicationName: string, hour: number = 9, minute: number = 0) => {
      if (!settings.enabled || !settings.medicationReminders) return '';
      return await notificationService.scheduleMedicationReminder(petName, medicationName, hour, minute);
    },
    [settings]
  );

  const scheduleWalkReminder = useCallback(
    async (petName: string, hour: number = 8, minute: number = 0) => {
      if (!settings.enabled || !settings.walkReminders) return '';
      return await notificationService.scheduleWalkReminder(petName, hour, minute);
    },
    [settings]
  );

  const cancelNotification = useCallback(async (id: string) => {
    await notificationService.cancelNotification(id);
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    await notificationService.cancelAllNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        pushToken,
        hasPermission,
        settings,
        updateSettings,
        requestPermission,
        scheduleVaccinationReminder,
        scheduleMedicationReminder,
        scheduleWalkReminder,
        cancelNotification,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications pitää käyttää NotificationProvider:n sisällä');
  }
  return context;
}
