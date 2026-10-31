import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext'; // 👈 Importamos el hook global

import HabitsScreen from '../screens/HabitsScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { isDarkMode } = useHabits(); // 👈 Extraemos el estado global del tema

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', // 👈 Dinámico según el tema
            borderTopColor: isDarkMode ? '#1e293b' : '#e2e8f0',     // 👈 Borde dinámico
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#ff6600', // Naranja AtomicFox
          tabBarInactiveTintColor: isDarkMode ? '#64748b' : '#94a3b8',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'list';

            if (route.name === 'Mis Hábitos') {
              iconName = focused ? 'checkbox' : 'checkbox-outline';
            } else if (route.name === 'Estadísticas') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Configuración') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'Mi Perfil') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Mis Hábitos" component={HabitsScreen} />
        <Tab.Screen name="Estadísticas" component={StatsScreen} />
        <Tab.Screen name="Configuración" component={SettingsScreen} />
        <Tab.Screen name="Mi Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}