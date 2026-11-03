import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configurar cómo se comportan las notificaciones cuando la app está abierta (solo si no es web)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // 🦊 NUEVO: Configuración del canal de alta prioridad para Android (Crítico para segundo plano)
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Hábitos Atómicos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff6600',
      sound: 'default',
    });
  }
}

// 1. Solicitar permisos al usuario
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('¡Permiso de notificaciones denegado! No podremos recordarte tus hábitos.');
    return false;
  }

  return true;
}

// 2. Programar un recordatorio diario para un hábito
export async function scheduleHabitReminder(habitName: string, hour: number, minute: number) {
  if (Platform.OS === 'web') {
    console.log(`[Web] Simulación: Recordatorio para "${habitName}" a las ${hour}:${minute}`);
    return;
  }

  try {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return;

    const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Notificaciones programadas actualmente: ${pendingNotifications.length}`);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚡ ¡Hora de tu hábito atómico!",
        subtitle: "AtomicFox te respalda",
        body: `Es momento de cumplir con: "${habitName}". ¡Hazlo por 2 minutos!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hour,
        minute: minute,
      },
    });

    console.log(`Notificación programada para "${habitName}" a las ${hour}:${minute}`);
  } catch (error) {
    console.error("Error al programar la notificación:", error);
  }
}

// 3. Cancelar todas las notificaciones
export async function cancelAllNotifications() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}