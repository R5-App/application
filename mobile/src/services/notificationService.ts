/**
 * Push Notification Service
 * 
 * Moduuli push-ilmoitusten hallintaan iOS:lle ja Androidille.
 * Käyttää expo-notifications -kirjastoa.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

const PUSH_TOKEN_KEY = '@mypet_push_token';
const NOTIFICATION_SETTINGS_KEY = '@mypet_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  walkReminders: boolean;
  healthReminders: boolean;
  vaccinationReminders: boolean;
  medicationReminders: boolean;
  calendarReminders: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  walkReminders: true,
  healthReminders: true,
  vaccinationReminders: true,
  medicationReminders: true,
  calendarReminders: true,
};

/**
 * Määritä miten ilmoitukset näytetään kun sovellus on auki
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Luo Android notification channel
 */
async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Yleiset ilmoitukset',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6750A4',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Muistutukset',
      description: 'Rokotus-, lääkitys- ja kalenterimuistutukset',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6750A4',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('walks', {
      name: 'Lenkkimuistutukset',
      description: 'Muistutukset lemmikin ulkoiluttamisesta',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
}

/**
 * Pyydä ilmoituslupa ja hanki push-token
 */
async function registerForPushNotifications(): Promise<string | null> {
  // Push-ilmoitukset vaativat fyysisen laitteen
  if (!Device.isDevice) {
    console.log('Push-ilmoitukset vaativat fyysisen laitteen');
    return null;
  }

  // Tarkista nykyiset oikeudet
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Pyydä lupa jos ei vielä myönnetty
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Ilmoituslupaa ei myönnetty');
    return null;
  }

  // Luo Android-kanavat
  await setupAndroidChannel();

  try {
    // Hae Expo push-token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    const token = tokenData.data;
    console.log('Push token:', token);
    return token;
  } catch (error) {
    console.error('Push-tokenin haku epäonnistui:', error);
    return null;
  }
}

/**
 * Notification Service
 */
const notificationService = {
  /**
   * Alusta ilmoituspalvelu ja rekisteröi push-token
   */
  async initialize(): Promise<string | null> {
    const token = await registerForPushNotifications();

    if (token) {
      // Tallenna token paikallisesti
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

      // Lähetä token backendille
      try {
        await apiClient.post('/api/notifications/register', {
          token,
          platform: Platform.OS,
          device_name: Device.modelName || 'Unknown',
        });
        console.log('Push-token rekisteröity backendille');
      } catch (error) {
        // Backend ei välttämättä tue vielä tätä endpointia
        console.log('Push-tokenin rekisteröinti backendille ohitettu:', error);
      }
    }

    return token;
  },

  /**
   * Hae tallennettu push-token
   */
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  },

  /**
   * Hae ilmoitusasetukset
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settingsJson) {
        return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      console.error('Ilmoitusasetusten lataus epäonnistui:', error);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  },

  /**
   * Tallenna ilmoitusasetukset
   */
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Ilmoitusasetusten tallennus epäonnistui:', error);
    }
  },

  /**
   * Tarkista onko ilmoituslupa myönnetty
   */
  async hasPermission(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Pyydä ilmoituslupa
   */
  async requestPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Ajasta paikallinen ilmoitus
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    channelId: string = 'default',
    data?: Record<string, unknown>
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: data || {},
        ...(Platform.OS === 'android' ? { channelId } : {}),
      },
      trigger,
    });
    return id;
  },

  /**
   * Ajasta muistutus tietylle päivämäärälle
   */
  async scheduleReminder(
    title: string,
    body: string,
    date: Date,
    data?: Record<string, unknown>
  ): Promise<string> {
    // Jos päivämäärä on menneisyydessä, ei ajasteta
    if (date.getTime() <= Date.now()) {
      console.log('Muistutuspäivämäärä on menneisyydessä, ohitetaan');
      return '';
    }

    return await this.scheduleLocalNotification(
      title,
      body,
      { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      'reminders',
      data
    );
  },

  /**
   * Ajasta toistuva päivittäinen muistutus
   */
  async scheduleDailyReminder(
    title: string,
    body: string,
    hour: number,
    minute: number,
    data?: Record<string, unknown>
  ): Promise<string> {
    return await this.scheduleLocalNotification(
      title,
      body,
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
      'walks',
      data
    );
  },

  /**
   * Ajasta rokotusmuistutus (päivää ennen)
   */
  async scheduleVaccinationReminder(
    petName: string,
    vaccineName: string,
    dueDate: Date,
    daysBefore: number = 7
  ): Promise<string> {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    reminderDate.setHours(9, 0, 0, 0);

    return await this.scheduleReminder(
      `${petName} - Rokotusmuistutus`,
      `${vaccineName} rokotus ${daysBefore === 0 ? 'tänään' : `${daysBefore} päivän päästä`}`,
      reminderDate,
      { type: 'vaccination', petName, vaccineName }
    );
  },

  /**
   * Ajasta lääkitysmuistutus
   */
  async scheduleMedicationReminder(
    petName: string,
    medicationName: string,
    hour: number = 9,
    minute: number = 0
  ): Promise<string> {
    return await this.scheduleDailyReminder(
      `${petName} - Lääkitysmuistutus`,
      `Muista antaa ${medicationName}`,
      hour,
      minute,
      { type: 'medication', petName, medicationName }
    );
  },

  /**
   * Ajasta lenkkimuistutus
   */
  async scheduleWalkReminder(
    petName: string,
    hour: number = 8,
    minute: number = 0
  ): Promise<string> {
    return await this.scheduleDailyReminder(
      `${petName} - Lenkkiaika! 🐾`,
      `${petName} odottaa ulkoilua`,
      hour,
      minute,
      { type: 'walk', petName }
    );
  },

  /**
   * Peruuta yksittäinen ajastettu ilmoitus
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  /**
   * Peruuta kaikki ajastetut ilmoitukset
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Hae kaikki ajastetut ilmoitukset
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  /**
   * Nollaa badge-laskuri
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  },

  /**
   * Lisää kuuntelija saapuville ilmoituksille (sovellus auki)
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Lisää kuuntelija ilmoituksen klikkaukselle
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Hae ilmoitus jolla sovellus avattiin (cold start)
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  },
};

export default notificationService;
