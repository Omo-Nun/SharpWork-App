import { useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import { getAccessToken } from './src/utils/secureStore';
import AppNavigator from './src/navigation/AppNavigator';

const LOCATION_TASK_NAME = 'background-location-task';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data) {
    const { locations } = data as any;
    if (locations && locations.length > 0) {
      const location = locations[0];
      console.log('Background location update:', location.coords);
      try {
        const token = await getAccessToken();
        if (token) {
          await axios.patch(`${API_URL}/api/artisan/location`, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (err) {
        console.error('Failed to post background location', err);
      }
    }
  }
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      // Push notification permissions
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      if (notifStatus === 'granted') {
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          const pushToken = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
          console.log('Expo Push Token:', pushToken.data);
          
          const token = await getAccessToken();
          if (token) {
            await axios.post(`${API_URL}/api/auth/push-token`, {
              pushToken: pushToken.data
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        } catch (err) {
          console.error('Failed to register push token', err);
        }
      }

      // Foreground + background location permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,       // Send update every 10 meters
            deferredUpdatesInterval: 10000, // Batch updates every 10 seconds
          });
        }
      }
    })();
  }, []);

  return <AppNavigator />;
}
