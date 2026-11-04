import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext';
import { supabase } from '../services/supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin'; // 👈 NUEVO: Importar Google Sign-In

export default function LoginScreen({ navigation }: any) {
  const { isDarkMode } = useHabits();
  
  // Estado para alternar entre Login y Registro
  const [isRegistering, setIsRegistering] = useState(false);

  // Campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🦊 Configurar Google Sign-In al montar el componente
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '115871417181-cdiatcjd8fhieitk19eoam2tpk2i079c.apps.googleusercontent.com', // 👈 Recuerda colocar aquí tu Web Client ID real de Google Cloud
      scopes: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    });
  }, []);

  // --- FLUJO DE GOOGLE SIGN-IN ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // 1. Verificar servicios de Google Play (obligatorio en Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 2. Abrir el selector de cuenta de Google
      const userInfo = await GoogleSignin.signIn();
      
      // 3. Obtener el idToken compatible con la versión de la librería
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;

      if (!idToken) {
        throw new Error('No se pudo obtener el ID Token de Google.');
      }

      // 4. Autenticar en Supabase usando el token de Google
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

      console.log('Sesión iniciada con Google:', data.user?.email);
    } catch (error: any) {
      console.error('Error en Google Sign-In:', error);
      Alert.alert('Error de Autenticación', error.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // 1. Validaciones básicas generales
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa el correo y la contraseña.');
      return;
    }

    if (isRegistering) {
      // --- VALIDACIONES EXTRA PARA REGISTRO ---
      if (!name.trim()) {
        Alert.alert('Nombre requerido', 'Por favor ingresa tu nombre completo.');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Las contraseñas no coinciden', 'Asegúrate de que la contraseña y su confirmación sean idénticas.');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      setLoading(true);

      // --- FLUJO DE REGISTRO ---
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      setLoading(false);

      if (error) {
        if (error.message.includes('already registered')) {
          Alert.alert('Correo registrado', 'Ya existe una cuenta asociada a este correo electrónico.');
        } else {
          Alert.alert('Error de Registro', error.message);
        }
      } else {
        Alert.alert(
          '¡Cuenta creada! 🦊', 
          'Revisa tu correo para confirmar tu cuenta o inicia sesión directamente si la confirmación está desactivada.'
        );
        setIsRegistering(false);
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      setLoading(true);

      // --- FLUJO DE INICIO DE SESIÓN ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      setLoading(false);

      if (error) {
        Alert.alert('Error de Acceso', error.message);
      } else {
        console.log('Sesión iniciada con éxito:', data.user);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1, backgroundColor: '#0f172a' }, !isDarkMode && { backgroundColor: '#f8fafc' }]}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingBottom: 32 }}>
        
        {/* --- CABECERA CON EL ZORRO EXTENDIDO --- */}
        <View style={{ 
          backgroundColor: '#fde68a', 
          width: '100%',
          height: 190, 
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <Image 
            source={require('../../assets/fox-avatar.png')} 
            style={{ 
              width: '100%', 
              height: '100%', 
              resizeMode: 'cover' 
            }} 
          />
        </View>

        {/* --- CONTENIDO DEL FORMULARIO --- */}
        <View style={{ paddingHorizontal: 28, marginTop: 20, flex: 1 }}>
          
          <Text style={[{ color: '#ffffff', fontSize: 26, fontWeight: 'bold' }, !isDarkMode && { color: '#0f172a' }]}>
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Text>
          
          <View style={{ marginTop: 4, marginBottom: 24, alignItems: 'flex-start' }}>
            <Text style={[{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }, !isDarkMode && { color: '#64748b' }]}>
              {isRegistering ? '¡Únete a AtomicFox y transforma tus días!' : '¡Comienza a cambiar tus hábitos!'}
            </Text>
            <View style={{ width: 36, height: 3, backgroundColor: '#ff6600', borderRadius: 2 }} />
          </View>

          {/* Botón Continuar con Google Conectado */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#ffffff', 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              paddingVertical: 14, 
              borderRadius: 16, 
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              opacity: loading ? 0.7 : 1
            }}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={{ marginRight: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', color: '#ea4335', fontSize: 16 }}>G</Text>
            </View>
            <Text style={{ color: '#0f172a', fontWeight: 'bold', fontSize: 15 }}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#334155' }} />
            <Text style={{ color: '#64748b', fontSize: 11, paddingHorizontal: 12, fontWeight: '600', letterSpacing: 0.5 }}>
              O CON TU CORREO
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#334155' }} />
          </View>

          {/* Campo Nombre (Solo en Registro) */}
          {isRegistering && (
            <>
              <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }, !isDarkMode && { color: '#64748b' }]}>
                Nombre Completo
              </Text>
              <View style={[
                { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, marginBottom: 16 },
                !isDarkMode && { backgroundColor: '#ffffff', borderColor: '#cbd5e1' }
              ]}>
                <Ionicons name="person-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Tu nombre"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                  style={[{ flex: 1, color: 'white', paddingVertical: 12 }, !isDarkMode && { color: '#0f172a' }]}
                />
              </View>
            </>
          )}

          {/* Campo Correo */}
          <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }, !isDarkMode && { color: '#64748b' }]}>
            Correo Electrónico
          </Text>
          <View style={[
            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, marginBottom: 16 },
            !isDarkMode && { backgroundColor: '#ffffff', borderColor: '#cbd5e1' }
          ]}>
            <Ionicons name="mail-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="demo@email.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={[{ flex: 1, color: 'white', paddingVertical: 12 }, !isDarkMode && { color: '#0f172a' }]}
            />
          </View>

          {/* Campo Contraseña */}
          <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }, !isDarkMode && { color: '#64748b' }]}>
            Contraseña
          </Text>
          <View style={[
            { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, marginBottom: 16 },
            !isDarkMode && { backgroundColor: '#ffffff', borderColor: '#cbd5e1' }
          ]}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={[{ flex: 1, color: 'white', paddingVertical: 12 }, !isDarkMode && { color: '#0f172a' }]}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Campo Confirmar Contraseña (Solo en Registro) */}
          {isRegistering && (
            <>
              <Text style={[{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }, !isDarkMode && { color: '#64748b' }]}>
                Confirmar Contraseña
              </Text>
              <View style={[
                { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, marginBottom: 24 },
                !isDarkMode && { backgroundColor: '#ffffff', borderColor: '#cbd5e1' }
              ]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[{ flex: 1, color: 'white', paddingVertical: 12 }, !isDarkMode && { color: '#0f172a' }]}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {!isRegistering && (
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
              <Text style={{ color: '#ff6600', fontSize: 12, fontWeight: '600' }}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          )}

          {/* Botón Principal Dinámico */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            style={{ 
              backgroundColor: '#ff6600', 
              paddingVertical: 16, 
              borderRadius: 16, 
              alignItems: 'center',
              opacity: loading ? 0.7 : 1,
              shadowColor: '#ff6600',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {loading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
            </Text>
          </TouchableOpacity>

        </View>

        {/* --- PIE DE PÁGINA PARA ALTERNAR --- */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={[{ color: '#94a3b8', fontSize: 13 }, !isDarkMode && { color: '#64748b' }]}>
            {isRegistering ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
          </Text>
          <TouchableOpacity onPress={() => {
            setIsRegistering(!isRegistering);
            setPassword('');
            setConfirmPassword('');
          }}>
            <Text style={{ color: '#ff6600', fontWeight: 'bold', fontSize: 13 }}>
              {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}