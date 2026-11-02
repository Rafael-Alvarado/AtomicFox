import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits, Habit } from '../context/HabitsContext'; 
import { scheduleHabitReminder } from '../services/notificationService'; 
import { supabase } from '../services/supabase';

interface HabitsScreenProps {
  session: any;
  [key: string]: any;
}

export default function HabitsScreen({ session }: HabitsScreenProps) {
  const { habits = [], setHabits, userLevel = 1, maxSlots = 3, addHabit, completeHabit, isDarkMode } = useHabits();

  const [modalVisible, setModalVisible] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitIdentity, setHabitIdentity] = useState('');
  const [habitTwoMinute, setHabitTwoMinute] = useState('');
  const [habitTime, setHabitTime] = useState('');

  const userName = 
    session?.user?.user_metadata?.full_name || 
    session?.user?.user_metadata?.name || 
    session?.user?.email?.split('@')[0] || 
    'Foxy';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 1. CARGAR HÁBITOS DESDE SUPABASE AL ABRIR LA PANTALLA
  useEffect(() => {
    async function fetchUserHabits() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error al cargar hábitos desde Supabase:', error.message);
      } else if (data && setHabits) {
        const formattedHabits: Habit[] = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.title || item.name,
          identity: item.category || item.identity || 'Hábito atómico',
          twoMinute: item.two_minute || 'Versión rápida',
          time: item.time || '20:00',
          progress: item.progress || 0,
          streak: item.streak || '0/7 días',
          streakCount: item.streak_count || 0,
        }));

        setHabits(formattedHabits);
      }
    }

    fetchUserHabits();
  }, [session]);

  const parseTimeStringToHoursMinutes = (timeStr: string) => {
    try {
      const cleanTime = timeStr.trim().toUpperCase();
      const isPM = cleanTime.includes('PM');
      const isAM = cleanTime.includes('AM');
      
      const timeWithoutSuffix = cleanTime.replace('PM', '').replace('AM', '').trim();
      let [hoursStr, minutesStr] = timeWithoutSuffix.split(':');
      
      let hours = parseInt(hoursStr, 10);
      let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

      if (isNaN(hours)) hours = 20; 
      if (isNaN(minutes)) minutes = 0;

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;

      return { hours, minutes };
    } catch (e) {
      return { hours: 20, minutes: 0 };
    }
  };

  // 2. GUARDAR HÁBITO (LOCAL + SUPABASE)
  const handleSaveHabit = async () => {
    if (!habitName.trim()) return;

    const finalTime = habitTime || '20:00';

    const success = addHabit({
      name: habitName,
      identity: habitIdentity || 'Hábito atómico',
      twoMinute: habitTwoMinute || 'Versión rápida',
      time: finalTime,
    });

    if (!success) {
      Alert.alert(
        "Límite de Slots Alcanzado",
        `Tu Nivel actual (${userLevel}) solo permite tener un máximo de ${maxSlots} hábitos activos. ¡Sube de nivel completando tus rachas para desbloquear más espacios!`
      );
      return; 
    }

    if (session?.user?.id) {
      const { error } = await supabase.from('habits').insert([
        {
          title: habitName,
          category: habitIdentity || 'Hábito atómico',
          two_minute: habitTwoMinute || 'Versión rápida',
          time: finalTime,
          progress: 0,
          streak_count: 0,
          streak: '0/7 días',
          user_id: session.user.id,
        }
      ]);

      if (error) {
        console.error('Error al guardar hábito en Supabase:', error.message);
      }
    }

    const { hours, minutes } = parseTimeStringToHoursMinutes(finalTime);
    scheduleHabitReminder(habitName, hours, minutes);

    setModalVisible(false);
    setHabitName('');
    setHabitIdentity('');
    setHabitTwoMinute('');
    setHabitTime('');
  };

  // 3. MARCAR HÁBITO COMO COMPLETADO (CHECK / 2 MINUTOS)
  const handleCompleteHabit = async (habitId: string, currentProgress: number) => {
    if (currentProgress === 100) return; // Si ya está al 100%, no hacemos nada

    // Actualizamos localmente en el contexto
    completeHabit(habitId);

    // Actualizamos en la base de datos de Supabase
    if (session?.user?.id) {
      const targetHabit = habits.find(h => h.id === habitId);
      const newStreakCount = (targetHabit?.streakCount || 0) + 1;

      const { error } = await supabase
        .from('habits')
        .update({ 
          progress: 100, 
          streak_count: newStreakCount,
          streak: `${newStreakCount}/7 días`
        })
        .eq('id', habitId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error al actualizar el hábito en Supabase:', error.message);
      }
    }
  };

  return (
    <View style={[{ flex: 1, backgroundColor: '#0f172a', paddingTop: 40 }, !isDarkMode && { backgroundColor: '#f8fafc' }]}>
      
      {/* Header con Insignia de Nivel, Slots y Botón de Cerrar Sesión */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[{ color: '#94a3b8', fontSize: 12 }, !isDarkMode && { color: '#64748b' }]}>AtomicFox</Text>
            <View style={{ backgroundColor: '#ff6600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Nivel {userLevel}</Text>
            </View>
          </View>
          
          <Text style={[{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginTop: 4 }, !isDarkMode && { color: '#0f172a' }]}>
            ¡Hola, {userName}!
          </Text>
          
          <Text style={[{ color: '#94a3b8', fontSize: 12 }, !isDarkMode && { color: '#64748b' }]}>{habits?.length || 0} / {maxSlots} slots utilizados</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ backgroundColor: '#334155', padding: 8, borderRadius: 12, marginRight: 8 }}
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={{ backgroundColor: '#ff6600', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>Nuevo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista Dinámica de Hábitos */}
      <ScrollView style={{ paddingHorizontal: 24, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {habits.map((habit) => {
          const isCompleted = habit.progress === 100;

          return (
            <View 
              key={habit.id} 
              style={[
                { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
                !isDarkMode && { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                  <View style={[{ backgroundColor: 'rgba(255, 102, 0, 0.2)', padding: 8, borderRadius: 12, marginRight: 12 }, !isDarkMode && { backgroundColor: '#fff7ed' }]}>
                    <Ionicons name="sunny" size={20} color="#ff6600" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ color: 'white', fontWeight: 'bold', fontSize: 16 }, !isDarkMode && { color: '#0f172a' }]} numberOfLines={1}>{habit.name}</Text>
                    <Text style={[{ color: '#94a3b8', fontSize: 12 }, !isDarkMode && { color: '#64748b' }]} numberOfLines={1}>{habit.twoMinute} • ({habit.time})</Text>
                  </View>
                </View>

                {/* BOTÓN PRINCIPAL DE CHECK (Superior) */}
                <TouchableOpacity 
                  onPress={() => handleCompleteHabit(habit.id, habit.progress)}
                  style={[
                    { borderWidth: 1, borderColor: '#c084fc', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' },
                    isCompleted && { backgroundColor: '#22c55e', borderColor: '#22c55e' }
                  ]}
                >
                  <Ionicons 
                    name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={isCompleted ? "white" : "#c084fc"} 
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ color: isCompleted ? 'white' : '#c084fc', fontSize: 12, fontWeight: 'bold' }}>
                    {habit.progress}%
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[{ width: '100%', backgroundColor: '#334155', height: 8, borderRadius: 999, marginVertical: 8 }, !isDarkMode && { backgroundColor: '#e2e8f0' }]}>
                <View style={{ backgroundColor: isCompleted ? '#22c55e' : '#ff6600', height: 8, borderRadius: 999, width: `${habit.progress}%` }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={[{ color: '#94a3b8', fontSize: 12 }, !isDarkMode && { color: '#64748b' }]}>{habit.streak}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#c084fc', fontSize: 12, fontWeight: '600', marginRight: 4 }}>Identidad: {habit.identity}</Text>
                </View>
              </View>

              <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 8 }, !isDarkMode && { borderTopColor: '#e2e8f0' }]}>
                <Text style={[{ color: '#94a3b8', fontSize: 11, flex: 1, marginRight: 8 }, !isDarkMode && { color: '#64748b' }]} numberOfLines={1}>Fácil: {habit.twoMinute}</Text>
                
                {/* BOTÓN SECUNDARIO DE 2 MINUTOS (Emergencia) */}
                <TouchableOpacity 
                  onPress={() => handleCompleteHabit(habit.id, habit.progress)}
                  style={[
                    { backgroundColor: 'rgba(255, 102, 0, 0.15)', borderWidth: 1, borderColor: '#ff6600', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
                    isCompleted && { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22c55e' }
                  ]}
                >
                  <Text style={[{ color: '#ff6600', fontSize: 11, fontWeight: 'bold' }, isCompleted && { color: '#22c55e' }]}>
                    {isCompleted ? '✅ ¡Completado!' : '⚡ 2 Min (Emergencia)'}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          );
        })}
      </ScrollView>

      {/* MODAL PARA CREAR NUEVO HÁBITO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <View style={[{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: '#334155' }, !isDarkMode && { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0' }]}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[{ color: 'white', fontSize: 20, fontWeight: 'bold' }, !isDarkMode && { color: '#0f172a' }]}>Nuevo Hábito</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Nombre del Hábito</Text>
            <TextInput
              placeholder="Ej. Leer un libro"
              placeholderTextColor="#64748b"
              value={habitName}
              onChangeText={setHabitName}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />

            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Identidad (¿Qué tipo de persona eres?)</Text>
            <TextInput
              placeholder="Ej. Soy un lector voraz"
              placeholderTextColor="#64748b"
              value={habitIdentity}
              onChangeText={setHabitIdentity}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />

            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Regla de 2 Minutos (Versión fácil)</Text>
            <TextInput
              placeholder="Ej. Leer una sola página"
              placeholderTextColor="#64748b"
              value={habitTwoMinute}
              onChangeText={setHabitTwoMinute}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />

            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Hora Programada</Text>
            <TextInput
              placeholder="Ej. 8:00 PM"
              placeholderTextColor="#64748b"
              value={habitTime}
              onChangeText={setHabitTime}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />

            <TouchableOpacity 
              onPress={handleSaveHabit}
              style={{ backgroundColor: '#ff6600', padding: 16, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Crear Hábito</Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}