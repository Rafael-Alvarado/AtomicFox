import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';

export default function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const { addHabit, isDarkMode } = useHabits();
  
  const [step, setStep] = useState(1);
  const [habitName, setHabitName] = useState('');
  const [identity, setIdentity] = useState('');
  const [twoMinute, setTwoMinute] = useState('');

  const handleNextStep = () => {
    if (step === 1 && !habitName.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa el nombre de tu hábito.");
      return;
    }
    if (step === 2 && !identity.trim()) {
      Alert.alert("Campo requerido", "Define la identidad en la que te quieres convertir.");
      return;
    }
    if (step === 3 && !twoMinute.trim()) {
      Alert.alert("Campo requerido", "Escribe una versión de 2 minutos fácil de cumplir.");
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Paso final: Guardar el hábito inicial
      const success = addHabit({
        name: habitName,
        identity: identity,
        twoMinute: twoMinute,
        time: '08:00 AM',
      });

      if (success) {
        onFinish();
      } else {
        Alert.alert("Error", "No se pudo crear el hábito.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, !isDarkMode && styles.lightContainer]}>
      {/* Cabecera con la mascota / Indicador de pasos */}
      <View style={styles.headerContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="rocket-outline" size={36} color="#ff6600" />
        </View>
        <Text style={[styles.title, !isDarkMode && styles.lightText]}>Bienvenido a Atomic Fox 🦊</Text>
        <Text style={styles.subtitle}>Diseñemos juntos tu primer sistema de éxito (Paso {step} de 3)</Text>
      </View>

      {/* Tarjeta interactiva del paso a paso */}
      <View style={[styles.card, !isDarkMode && styles.lightCard]}>
        {step === 1 && (
          <View>
            <Text style={[styles.label, !isDarkMode && styles.lightText]}>1. ¿Qué hábito quieres construir?</Text>
            <Text style={styles.hint}>Ej. Leer, Meditar, Salir a correr, Estudiar inglés.</Text>
            <TextInput
              style={[styles.input, !isDarkMode && styles.lightInput]}
              placeholder="Ej. Leer 10 páginas"
              placeholderTextColor="#64748b"
              value={habitName}
              onChangeText={setHabitName}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.label, !isDarkMode && styles.lightText]}>2. ¿En qué identidad te quieres convertir?</Text>
            <Text style={styles.hint}>Cada acción es un voto por el tipo de persona que deseas ser.</Text>
            <TextInput
              style={[styles.input, !isDarkMode && styles.lightInput]}
              placeholder="Ej. Quiero convertirme en un lector ávido"
              placeholderTextColor="#64748b"
              value={identity}
              onChangeText={setIdentity}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.label, !isDarkMode && styles.lightText]}>3. Tu regla de los 2 minutos</Text>
            <Text style={styles.hint}>Haz que sea tan fácil que no puedas decir que no. ¿Cómo reduces el hábito a 2 minutos?</Text>
            <TextInput
              style={[styles.input, !isDarkMode && styles.lightInput]}
              placeholder="Ej. Leer solo una página antes de dormir"
              placeholderTextColor="#64748b"
              value={twoMinute}
              onChangeText={setTwoMinute}
            />
          </View>
        )}

        {/* Botón de Siguiente / Finalizar */}
        <TouchableOpacity style={styles.button} onPress={handleNextStep}>
          <Text style={styles.buttonText}>{step === 3 ? '¡Crear mi primer hábito! 🚀' : 'Siguiente'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  lightContainer: { backgroundColor: '#f8fafc' },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  iconContainer: { width: 70, height: 70, borderRadius: 20, backgroundColor: 'rgba(255, 102, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
  card: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  lightCard: { backgroundColor: '#ffffff', borderColor: '#e2e8f0' },
  label: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 6 },
  hint: { fontSize: 12, color: '#94a3b8', marginBottom: 16, lineHeight: 18 },
  input: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 14, color: 'white', fontSize: 14, marginBottom: 20 },
  lightInput: { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#0f172a' },
  lightText: { color: '#0f172a' },
  button: { backgroundColor: '#ff6600', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});