import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';

export default function StatsScreen() {
  const { habits, userLevel, maxSlots, weeklyHistory } = useHabits();

  // --- CÁLCULOS ESTADÍSTICOS (DÍA 11) ---
  const totalHabits = habits.length;
  
  const averageProgress = totalHabits > 0 
    ? Math.round(habits.reduce((acc, h) => acc + h.progress, 0) / totalHabits) 
    : 0;
  
  const maxStreakCount = totalHabits > 0 
    ? Math.max(...habits.map(h => h.streakCount), 0) 
    : 0;

  const completedTodayCount = habits.filter(h => h.progress === 100).length;

  // --- CONSTRUCCIÓN DEL GRÁFICO SEMANAL REAL (DÍA 12) ---
  // Generamos las fechas correspondientes a la semana actual (Lunes a Domingo)
  const getWeekDaysData = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0: Domingo, 1: Lunes, ...
    
    // Calcular la diferencia de días para llegar al Lunes previo
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return labels.map((label, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);

      const dateKey = dayDate.toDateString();
      const isToday = dateKey === today.toDateString();

      // Si es el día actual, toma el progreso dinámico actual; si es otro día, busca en el historial
      const dayProgress = isToday 
        ? averageProgress 
        : (weeklyHistory[dateKey] || 0);

      return {
        day: label,
        progress: dayProgress,
        isToday,
      };
    });
  };

  const weekDays = getWeekDaysData();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Estadísticas Diarias</Text>
        <Text style={styles.subtitle}>Tu rendimiento y constancia en AtomicFox</Text>
      </View>

      {/* Tarjeta Principal de Progreso General */}
      <View style={styles.cardMain}>
        <Ionicons name="flame" size={36} color="#ff6600" />
        <Text style={styles.mainCardTitle}>Cumplimiento de Hoy</Text>
        <Text style={styles.mainCardValue}>{averageProgress}%</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${averageProgress}%` }]} />
        </View>
        <Text style={styles.mainCardSubtext}>
          {completedTodayCount} de {totalHabits} hábitos completados hoy
        </Text>
      </View>

      {/* Fila de Métricas Secundarias */}
      <View style={styles.rowContainer}>
        <View style={styles.statCard}>
          <Ionicons name="layers-outline" size={24} color="#38bdf8" />
          <Text style={styles.statLabel}>Slots Usados</Text>
          <Text style={styles.statValue}>{totalHabits} / {maxSlots}</Text>
          <Text style={styles.statSubtext}>Nivel actual: {userLevel}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={24} color="#c084fc" />
          <Text style={styles.statLabel}>Mejor Racha</Text>
          <Text style={styles.statValue}>🔥 {maxStreakCount}</Text>
          <Text style={styles.statSubtext}>Días consecutivos</Text>
        </View>
      </View>

      {/* Gráfico de Barras Semanal Real */}
      <View style={styles.weeklyCard}>
        <View style={styles.weeklyHeader}>
          <Ionicons name="bar-chart-outline" size={20} color="#ff6600" />
          <Text style={styles.weeklyTitle}>Volumen Semanal (Lun - Dom)</Text>
        </View>
        
        <View style={styles.chartContainer}>
          {weekDays.map((item, index) => {
            const barHeight = (item.progress / 100) * 110;

            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barPercentageText}>{item.progress}%</Text>
                
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: barHeight > 0 ? barHeight : 4, 
                        backgroundColor: item.isToday ? '#ff6600' : '#334155' 
                      }
                    ]} 
                  />
                </View>

                <Text style={[styles.barDayText, item.isToday && styles.todayText]}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
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
  cardMain: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainCardTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
  },
  mainCardValue: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#ff6600',
    marginVertical: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff6600',
    borderRadius: 4,
  },
  mainCardSubtext: {
    fontSize: 12,
    color: '#64748b',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: '#64748b',
  },
  weeklyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barPercentageText: {
    fontSize: 9,
    color: '#94a3b8',
    marginBottom: 4,
  },
  barBackground: {
    width: 12,
    height: 110,
    backgroundColor: '#0f172a',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDayText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
  },
  todayText: {
    color: '#ff6600',
    fontWeight: 'bold',
  },
});