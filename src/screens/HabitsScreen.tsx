import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext'; 

export default function HabitsScreen() {
  const { habits, userLevel, maxSlots, addHabit, completeHabit } = useHabits(); // <-- Añadido maxSlots aquí

  const [modalVisible, setModalVisible] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitIdentity, setHabitIdentity] = useState('');
  const [habitTwoMinute, setHabitTwoMinute] = useState('');
  const [habitTime, setHabitTime] = useState('');

const handleSaveHabit = () => {
    if (!habitName.trim()) return;

    const success = addHabit({
      name: habitName,
      identity: habitIdentity || 'Hábito atómico',
      twoMinute: habitTwoMinute || 'Versión rápida',
      time: habitTime || 'Todo el día',
    });

    console.log("Resultado de addHabit (success):", success); // <-- Mira esto en tu terminal
    console.log("Hábitos actuales:", habits.length, "Slots máximos:", maxSlots); // <-- Mira esto también

    if (!success) {
      Alert.alert(
        "Límite de Slots Alcanzado",
        `Tu Nivel actual (${userLevel}) solo permite tener un máximo de ${maxSlots} hábitos activos. ¡Sube de nivel completando tus rachas para desbloquear más espacios!`
      );
      return; 
    }

    setModalVisible(false);
    setHabitName('');
    setHabitIdentity('');
    setHabitTwoMinute('');
    setHabitTime('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a', paddingTop: 40 }}>
      {/* Header con Insignia de Nivel y Slots (Día 8 y 9) */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>AtomicFox</Text>
            <View style={{ backgroundColor: '#ff6600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Nivel {userLevel}</Text>
            </View>
          </View>
          <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>¡Hola, Usuario!</Text>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{habits.length} / {maxSlots} slots utilizados</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: '#ff6600', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '600', marginLeft: 4 }}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista Dinámica de Hábitos */}
      <ScrollView style={{ paddingHorizontal: 24, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {habits.map((habit) => (
          <View key={habit.id} style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                <View style={{ backgroundColor: 'rgba(255, 102, 0, 0.2)', padding: 8, borderRadius: 12, marginRight: 12 }}>
                  <Ionicons name="sunny" size={20} color="#ff6600" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>{habit.name}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }} numberOfLines={1}>{habit.twoMinute} • ({habit.time})</Text>
                </View>
              </View>
              <View style={{ borderWidth: 1, borderColor: '#c084fc', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: '#c084fc', fontSize: 12, fontWeight: 'bold' }}>{habit.progress}%</Text>
              </View>
            </View>

            <View style={{ width: '100%', backgroundColor: '#334155', height: 8, borderRadius: 999, marginVertical: 8 }}>
              <View style={{ backgroundColor: '#ff6600', height: 8, borderRadius: 999, width: `${habit.progress}%` }} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>{habit.streak}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#c084fc', fontSize: 12, fontWeight: '600', marginRight: 4 }}>Identidad: {habit.identity}</Text>
              </View>
            </View>

            {/* --- BOTÓN DE EMERGENCIA (DÍA 6) --- */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 8 }}>
              <Text style={{ color: '#94a3b8', fontSize: 11, flex: 1, marginRight: 8 }} numberOfLines={1}>Fácil: {habit.twoMinute}</Text>
              
              <TouchableOpacity 
                onPress={() => completeHabit(habit.id)}
                style={{ backgroundColor: 'rgba(255, 102, 0, 0.15)', borderWidth: 1, borderColor: '#ff6600', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
              >
                <Text style={{ color: '#ff6600', fontSize: 11, fontWeight: 'bold' }}>⚡ 2 Min (Emergencia)</Text>
              </TouchableOpacity>
            </View>
            {/* ---------------------------------- */}

          </View>
        ))}
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
          <View style={{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: '#334155' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Nuevo Hábito</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Nombre del Hábito</Text>
            <TextInput
              placeholder="Ej. Leer un libro"
              placeholderTextColor="#64748b"
              value={habitName}
              onChangeText={setHabitName}
              style={{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }}
            />

            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Identidad (¿Qué tipo de persona eres?)</Text>
            <TextInput
              placeholder="Ej. Soy un lector voraz"
              placeholderTextColor="#64748b"
              value={habitIdentity}
              onChangeText={setHabitIdentity}
              style={{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }}
            />

            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Regla de 2 Minutos (Versión fácil)</Text>
            <TextInput
              placeholder="Ej. Leer una sola página"
              placeholderTextColor="#64748b"
              value={habitTwoMinute}
              onChangeText={setHabitTwoMinute}
              style={{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }}
            />

            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Hora Programada</Text>
            <TextInput
              placeholder="Ej. 8:00 PM"
              placeholderTextColor="#64748b"
              value={habitTime}
              onChangeText={setHabitTime}
              style={{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' }}
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