import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from './src/services/supabase';
import { HabitsProvider } from './src/context/HabitsContext'; 

// Importas tu navegador principal y el login
import AppNavigator from './src/navigation/AppNavigator'; 
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión activa al arrancar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    <HabitsProvider>
      {/* Si hay sesión, mostramos el navegador completo de la app. Si no, el Login. */}
      {session && session.user ? (
        <AppNavigator session={session} /> 
      ) : (
        <LoginScreen />
      )}
    </HabitsProvider>
  );
}