import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';

export default function StatsScreen() {
  const { habits, userLevel, maxSlots, weeklyHistory, isDarkMode } = useHabits(); // 👈 Añadido isDarkMode aquí

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
  const getWeekDaysData = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
    
    // Mapeo exacto para que Lun = 0, Mar = 1, ..., Dom = 6
    const adjustedTodayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Calcular la fecha del Lunes de esta semana para buscar en el historial
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return labels.map((label, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);

      const dateKey = dayDate.toDateString();
      
      // Determinamos si este índice de la barra es el día de hoy
      const isToday = index === adjustedTodayIndex;

      // Si es hoy, muestra el progreso dinámico actual; si es otro día, busca en el historial guardado
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

  // --- CONSTRUCCIÓN DE LA MATRIZ MENSUAL (DÍA 13) ---
  const getMonthDaysData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateKey = dateObj.toDateString();
      
      // Comparamos fecha exacta sin horas para el "hoy"
      const isToday = dateObj.toDateString() === today.toDateString();

      const progress = isToday ? averageProgress : (weeklyHistory[dateKey] || 0);

      // Asignación de colores según el mapa de calor (Día 13)
      let statusColor = isDarkMode ? '#334155' : '#cbd5e1'; // Color por defecto según el tema
      if (progress === 100) {
        statusColor = '#22c55e'; // 🟢 Verde = cumplido
      } else if (progress > 0) {
        statusColor = '#f59e0b'; // 🟡 Amarillo/Naranja = parcial
      } else if (dateObj < today && !isToday) {
        statusColor = '#ef4444'; // 🔴 Rojo = no realizado en días pasados
      }

      monthDays.push({
        day,
        progress,
        statusColor,
        isToday,
      });
    }

    return monthDays;
  };

  const weekDays = getWeekDaysData();
  const monthDays = getMonthDaysData();

  return (
    <ScrollView style={[styles.container, !isDarkMode && styles.lightContainer]} contentContainerStyle={styles.contentContainer}>
      
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={[styles.title, !isDarkMode && styles.lightText]}>Estadísticas Diarias</Text>
        <Text style={[styles.subtitle, !isDarkMode && styles.lightSubtext]}>Tu rendimiento y constancia en AtomicFox</Text>
      </View>

      {/* Tarjeta Principal de Progreso General */}
      <View style={[styles.cardMain, !isDarkMode && styles.lightCard]}>
        <Ionicons name="flame" size={36} color="#ff6600" />
        <Text style={[styles.mainCardTitle, !isDarkMode && styles.lightSubtext]}>Cumplimiento de Hoy</Text>
        <Text style={styles.mainCardValue}>{averageProgress}%</Text>
        <View style={[styles.progressBarBackground, !isDarkMode && styles.lightProgressBarBackground]}>
          <View style={[styles.progressBarFill, { width: `${averageProgress}%` }]} />
        </View>
        <Text style={[styles.mainCardSubtext, !isDarkMode && styles.lightSubtext]}>
          {completedTodayCount} de {totalHabits} hábitos completados hoy
        </Text>
      </View>

      {/* Fila de Métricas Secundarias */}
      <View style={styles.rowContainer}>
        <View style={[styles.statCard, !isDarkMode && styles.lightCard]}>
          <Ionicons name="layers-outline" size={24} color="#38bdf8" />
          <Text style={[styles.statLabel, !isDarkMode && styles.lightSubtext]}>Slots Usados</Text>
          <Text style={[styles.statValue, !isDarkMode && styles.lightText]}>{totalHabits} / {maxSlots}</Text>
          <Text style={[styles.statSubtext, !isDarkMode && styles.lightSubtext]}>Nivel actual: {userLevel}</Text>
        </View>

        <View style={[styles.statCard, !isDarkMode && styles.lightCard]}>
          <Ionicons name="trophy-outline" size={24} color="#c084fc" />
          <Text style={[styles.statLabel, !isDarkMode && styles.lightSubtext]}>Mejor Racha</Text>
          <Text style={[styles.statValue, !isDarkMode && styles.lightText]}>🔥 {maxStreakCount}</Text>
          <Text style={[styles.statSubtext, !isDarkMode && styles.lightSubtext]}>Días consecutivos</Text>
        </View>
      </View>

      {/* Gráfico de Barras Semanal Real */}
      <View style={[styles.weeklyCard, !isDarkMode && styles.lightCard]}>
        <View style={styles.weeklyHeader}>
          <Ionicons name="bar-chart-outline" size={20} color="#ff6600" />
          <Text style={[styles.weeklyTitle, !isDarkMode && styles.lightText]}>Volumen Semanal (Lun - Dom)</Text>
        </View>
        
        <View style={styles.chartContainer}>
          {weekDays.map((item, index) => {
            const barHeight = (item.progress / 100) * 110;

            return (
              <View key={index} style={styles.barColumn}>
                <Text style={[styles.barPercentageText, !isDarkMode && styles.lightSubtext]}>{item.progress}%</Text>
                
                <View style={[styles.barBackground, !isDarkMode && styles.lightBarBackground]}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: barHeight > 0 ? barHeight : 4, 
                        backgroundColor: item.isToday ? '#ff6600' : (isDarkMode ? '#334155' : '#cbd5e1') 
                      }
                    ]} 
                  />
                </View>

                <Text style={[styles.barDayText, item.isToday && styles.todayText, !isDarkMode && !item.isToday && { color: '#64748b' }]}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Matriz Mensual de Puntos / Mapa de Calor (Día 13) */}
      <View style={[styles.monthlyCard, !isDarkMode && styles.lightCard]}>
        <View style={styles.weeklyHeader}>
          <Ionicons name="calendar-outline" size={20} color="#22c55e" />
          <Text style={[styles.weeklyTitle, !isDarkMode && styles.lightText]}>Tus habitos mensuales</Text>
        </View>

        <View style={[styles.legendContainer, !isDarkMode && styles.lightLegendContainer]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={[styles.legendText, !isDarkMode && styles.lightSubtext]}>Cumplido</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.legendText, !isDarkMode && styles.lightSubtext]}>Parcial</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.legendText, !isDarkMode && styles.lightSubtext]}>Fallido</Text>
          </View>
        </View>

        <View style={styles.matrixGrid}>
          {monthDays.map((item) => (
            <View 
              key={item.day} 
              style={[
                styles.matrixCell, 
                { backgroundColor: item.statusColor },
                item.isToday && (isDarkMode ? styles.matrixCellToday : styles.lightMatrixCellToday)
              ]}
            >
              <Text style={styles.matrixCellText}>{item.day}</Text>
            </View>
          ))}
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
  lightText: {
    color: '#0f172a',
  },
  lightSubtext: {
    color: '#64748b',
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
  lightCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
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
  lightProgressBarBackground: {
    backgroundColor: '#e2e8f0',
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
    marginBottom: 20,
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
  lightBarBackground: {
    backgroundColor: '#f1f5f9',
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
  monthlyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 10,
  },
  lightLegendContainer: {
    backgroundColor: '#f1f5f9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  matrixCell: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixCellToday: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  lightMatrixCellToday: {
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  matrixCellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});