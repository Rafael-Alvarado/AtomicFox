import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';

export default function ProfileScreen() {
  const { habits, userLevel, maxSlots } = useHabits();

  const totalHabits = habits.length;
  const completedTodayCount = habits.filter(h => h.progress === 100).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Encabezado del Perfil */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Información de tu cuenta y progreso</Text>
      </View>

      {/* Tarjeta de Avatar y Rango */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="paw" size={48} color="#ff6600" />
        </View>
        <Text style={styles.userName}>Operador AtomicFox</Text>
        <View style={styles.badgeContainer}>
          <Ionicons name="shield-checkmark" size={16} color="#38bdf8" />
          <Text style={styles.badgeText}>Nivel de Usuario: {userLevel}</Text>
        </View>
      </View>

      {/* Estadísticas de Cuenta */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Resumen de Actividad</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="list-outline" size={20} color="#ff6600" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Hábitos Activos</Text>
              <Text style={styles.infoValue}>{totalHabits} de {maxSlots} slots usados</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="checkbox-outline" size={20} color="#22c55e" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Completados Hoy</Text>
              <Text style={styles.infoValue}>{completedTodayCount} hábitos al 100%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Opciones de la Cuenta */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Ajustes y Sistema</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={20} color="#94a3b8" />
          <Text style={styles.menuText}>Editar Nombre de Usuario</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-outline" size={20} color="#94a3b8" />
          <Text style={styles.menuText}>Privacidad y Datos</Text>
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
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ff6600',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '600',
    marginLeft: 6,
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
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
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
});