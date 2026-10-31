import * as Notifications from 'expo-notifications';

// Configurar cómo se comportan las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 1. Solicitar permisos al usuario
export async function registerForPushNotificationsAsync() {
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
  try {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) return;

    // 🦊 Corrección: Usamos getAllScheduledNotificationsAsync() en lugar de pendingNotificationRequests
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
  await Notifications.cancelAllScheduledNotificationsAsync();
}