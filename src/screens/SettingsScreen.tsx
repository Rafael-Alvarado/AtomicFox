import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';
import { registerForPushNotificationsAsync, cancelAllNotifications } from '../services/notificationService'; // 👈 Importamos el servicio (Día 16)

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useHabits();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // 👈 Manejador del toggle de notificaciones (Día 16)
  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const granted = await registerForPushNotificationsAsync();
      if (!granted) {
        setNotificationsEnabled(false);
      }
    } else {
      await cancelAllNotifications();
    }
  };

  return (
    <ScrollView style={[styles.container, !isDarkMode && styles.lightContainer]} contentContainerStyle={styles.contentContainer}>
      
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={[styles.title, !isDarkMode && styles.lightText]}>Configuración</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia en AtomicFox</Text>
      </View>

      {/* Sección de Apariencia */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, !isDarkMode && styles.lightSubtext]}>Apariencia</Text>
        
        <View style={[styles.settingCard, !isDarkMode && styles.lightCard]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIconContainer, !isDarkMode && styles.lightIconContainer]}>
              <Ionicons name="moon-outline" size={20} color="#ff6600" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, !isDarkMode && styles.lightText]}>Modo Oscuro Global</Text>
              <Text style={styles.settingSublabel}>Cambia el tema en toda la aplicación</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#334155', true: '#ff6600' }}
              thumbColor={'#ffffff'}
            />
          </View>
        </View>
      </View>

      {/* Sección de Notificaciones y Preferencias */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, !isDarkMode && styles.lightSubtext]}>Preferencias</Text>
        
        <View style={[styles.settingCard, !isDarkMode && styles.lightCard]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIconContainer, !isDarkMode && styles.lightIconContainer]}>
              <Ionicons name="notifications-outline" size={20} color="#38bdf8" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, !isDarkMode && styles.lightText]}>Notificaciones Diarias</Text>
              <Text style={styles.settingSublabel}>Recordatorios para cumplir tus hábitos</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle} // 👈 Conectado al servicio nativo
              trackColor={{ false: '#334155', true: '#38bdf8' }}
              thumbColor={'#ffffff'}
            />
          </View>
        </View>
      </View>

      {/* Sección de Sistema / Acerca de */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, !isDarkMode && styles.lightSubtext]}>Sistema</Text>
        
        <TouchableOpacity style={[styles.menuItem, !isDarkMode && styles.lightCard]}>
          <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
          <Text style={[styles.menuText, !isDarkMode && styles.lightText]}>Versión de la Aplicación</Text>
          <Text style={styles.versionText}>v1.0.0 (Día 16)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, !isDarkMode && styles.lightCard]}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Reiniciar Datos de Fábrica</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  lightContainer: {
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  lightSubtext: {
    color: '#334155',
  },
  lightText: {
    color: '#0f172a',
  },
  settingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lightCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lightIconContainer: {
    backgroundColor: '#f1f5f9',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  settingSublabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    marginLeft: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
});