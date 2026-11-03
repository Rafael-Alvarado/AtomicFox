import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';
import { supabase } from '../services/supabase';

interface ProfileScreenProps {
  session: any;
  [key: string]: any;
}

export default function ProfileScreen({ session }: ProfileScreenProps) {
  const { habits = [], userLevel = 1, maxSlots = 3, isDarkMode } = useHabits();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const totalHabits = habits.length;
  const completedTodayCount = habits.filter(h => h.progress === 100).length;

  const rawUserName = 
    session?.user?.user_metadata?.full_name || 
    session?.user?.user_metadata?.name || 
    session?.user?.email?.split('@')[0] || 
    'Operador AtomicFox';

  const userName = rawUserName;

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir de AtomicFox?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive", 
          onPress: async () => {
            await supabase.auth.signOut();
          } 
        }
      ]
    );
  };

  const handleUpdateName = async () => {
    if (!newFullName.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: newFullName.trim() }
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("¡Éxito!", "Nombre de usuario actualizado correctamente.");
      setEditModalVisible(false);
      setNewFullName('');
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Alert.alert("Error", "Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("¡Correo actualizado!", "Verifica tu nueva bandeja de entrada si Supabase requiere confirmación.");
      setEmailModalVisible(false);
      setNewEmail('');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("¡Éxito!", "Tu contraseña ha sido actualizada correctamente.");
      setPasswordModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <ScrollView style={[styles.container, !isDarkMode && styles.lightContainer]} contentContainerStyle={styles.contentContainer}>
      
      {/* Encabezado del Perfil */}
      <View style={styles.header}>
        <Text style={[styles.title, !isDarkMode && styles.lightText]}>Mi Perfil</Text>
        <Text style={[styles.subtitle, !isDarkMode && styles.lightSubtext]}>Información de tu cuenta y seguridad</Text>
      </View>

      {/* Tarjeta de Avatar y Rango */}
      <View style={[styles.profileCard, !isDarkMode && styles.lightCard]}>
        <View style={[styles.avatarContainer, !isDarkMode && styles.lightAvatarContainer]}>
          <Ionicons name="paw" size={48} color="#ff6600" />
        </View>
        
        <Text style={[styles.userName, !isDarkMode && styles.lightText]}>
          {userName}
        </Text>

        <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }, !isDarkMode && { color: '#64748b' }]}>
          {session?.user?.email || 'Foxy User'}
        </Text>
        
        <View style={[styles.badgeContainer, !isDarkMode && styles.lightBadgeContainer]}>
          <Ionicons name="shield-checkmark" size={16} color="#38bdf8" />
          <Text style={styles.badgeText}>Nivel de Usuario: {userLevel}</Text>
        </View>
      </View>

      {/* Estadísticas de Cuenta */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, !isDarkMode && styles.lightText]}>Resumen de Actividad</Text>
        
        <View style={[styles.infoCard, !isDarkMode && styles.lightCard]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconContainer, !isDarkMode && styles.lightAvatarContainer]}>
              <Ionicons name="list-outline" size={20} color="#ff6600" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, !isDarkMode && styles.lightSubtext]}>Hábitos Activos</Text>
              <Text style={[styles.infoValue, !isDarkMode && styles.lightText]}>{totalHabits} de {maxSlots} slots usados</Text>
            </View>
          </View>

          <View style={[styles.separator, !isDarkMode && styles.lightSeparator]} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconContainer, !isDarkMode && styles.lightAvatarContainer]}>
              <Ionicons name="checkbox-outline" size={20} color="#22c55e" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, !isDarkMode && styles.lightSubtext]}>Completados Hoy</Text>
              <Text style={[styles.infoValue, !isDarkMode && styles.lightText]}>{completedTodayCount} hábitos al 100%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Opciones de Seguridad y Cuenta */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, !isDarkMode && styles.lightText]}>Seguridad y Cuenta</Text>
        
        {/* Editar Nombre */}
        <TouchableOpacity 
          style={[styles.menuItem, !isDarkMode && styles.lightCard]}
          onPress={() => {
            setNewFullName(rawUserName);
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="person-outline" size={20} color="#38bdf8" />
          <Text style={[styles.menuText, !isDarkMode && styles.lightText]}>Editar Nombre de Usuario</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        {/* Cambiar Correo */}
        <TouchableOpacity 
          style={[styles.menuItem, !isDarkMode && styles.lightCard]}
          onPress={() => setEmailModalVisible(true)}
        >
          <Ionicons name="mail-outline" size={20} color="#38bdf8" />
          <Text style={[styles.menuText, !isDarkMode && styles.lightText]}>Actualizar Correo Electrónico</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        {/* Cambiar Contraseña */}
        <TouchableOpacity 
          style={[styles.menuItem, !isDarkMode && styles.lightCard]}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#38bdf8" />
          <Text style={[styles.menuText, !isDarkMode && styles.lightText]}>Cambiar Contraseña</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        {/* Cerrar Sesión */}
        <TouchableOpacity 
          style={[styles.menuItem, !isDarkMode && styles.lightCard, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Cerrar Sesión</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* MODAL EDITAR NOMBRE */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={[{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: '#334155' }, !isDarkMode && { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[{ color: 'white', fontSize: 20, fontWeight: 'bold' }, !isDarkMode && { color: '#0f172a' }]}>Editar Nombre</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Nuevo Nombre Completo</Text>
            <TextInput
              placeholder="Ej. Rafael Pérez"
              placeholderTextColor="#64748b"
              value={newFullName}
              onChangeText={setNewFullName}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />
            <TouchableOpacity onPress={handleUpdateName} disabled={loading} style={{ backgroundColor: '#ff6600', padding: 16, borderRadius: 12, alignItems: 'center', opacity: loading ? 0.7 : 1 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL ACTUALIZAR CORREO */}
      <Modal animationType="slide" transparent={true} visible={emailModalVisible} onRequestClose={() => setEmailModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={[{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: '#334155' }, !isDarkMode && { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[{ color: 'white', fontSize: 20, fontWeight: 'bold' }, !isDarkMode && { color: '#0f172a' }]}>Actualizar Correo</Text>
              <TouchableOpacity onPress={() => setEmailModalVisible(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Nuevo Correo Electrónico</Text>
            <TextInput
              placeholder="tucorreo@email.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={newEmail}
              onChangeText={setNewEmail}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />
            <TouchableOpacity onPress={handleUpdateEmail} disabled={loading} style={{ backgroundColor: '#ff6600', padding: 16, borderRadius: 12, alignItems: 'center', opacity: loading ? 0.7 : 1 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Actualizando...' : 'Actualizar Correo'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      <Modal animationType="slide" transparent={true} visible={passwordModalVisible} onRequestClose={() => setPasswordModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={[{ backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: '#334155' }, !isDarkMode && { backgroundColor: '#ffffff', borderTopColor: '#e2e8f0' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[{ color: 'white', fontSize: 20, fontWeight: 'bold' }, !isDarkMode && { color: '#0f172a' }]}>Cambiar Contraseña</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Nueva Contraseña (mínimo 6 caracteres)</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />
            <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }, !isDarkMode && { color: '#64748b' }]}>Confirmar Nueva Contraseña</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[{ backgroundColor: '#0f172a', color: 'white', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' }, !isDarkMode && { backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }]}
            />
            <TouchableOpacity onPress={handleUpdatePassword} disabled={loading} style={{ backgroundColor: '#ff6600', padding: 16, borderRadius: 12, alignItems: 'center', opacity: loading ? 0.7 : 1 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{loading ? 'Actualizando...' : 'Cambiar Contraseña'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  lightContainer: { backgroundColor: '#f8fafc' },
  contentContainer: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  lightText: { color: '#0f172a' },
  lightSubtext: { color: '#64748b' },
  profileCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#334155', alignItems: 'center', marginBottom: 24 },
  lightCard: { backgroundColor: '#ffffff', borderColor: '#e2e8f0' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#ff6600' },
  lightAvatarContainer: { backgroundColor: '#f1f5f9' },
  userName: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  lightBadgeContainer: { backgroundColor: '#f1f5f9' },
  badgeText: { fontSize: 12, color: '#38bdf8', fontWeight: '600', marginLeft: 6 },
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  infoCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  infoIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#94a3b8' },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: 'white', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#334155', marginVertical: 8 },
  lightSeparator: { backgroundColor: '#e2e8f0' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 10 },
  menuText: { flex: 1, fontSize: 14, color: 'white', marginLeft: 12 },
});