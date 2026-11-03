import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../context/HabitsContext'; 

import HabitsScreen from '../screens/HabitsScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  session: any;
}

export default function AppNavigator({ session }: AppNavigatorProps) {
  const { isDarkMode } = useHabits(); 

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
            borderTopColor: isDarkMode ? '#1e293b' : '#e2e8f0',    
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#ff6600', 
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
        {/* 1. Mis Hábitos con sesión */}
        <Tab.Screen name="Mis Hábitos">
          {(props) => <HabitsScreen {...props} session={session} />}
        </Tab.Screen>
        
        {/* 2. Estadísticas con sesión */}
        <Tab.Screen name="Estadísticas">
          {(props) => <StatsScreen {...props} session={session} />}
        </Tab.Screen>

        {/* 4. Mi Perfil con sesión */}
        <Tab.Screen name="Mi Perfil">
          {(props) => <ProfileScreen {...props} session={session} />}
        </Tab.Screen>
        
        {/* 3. Configuración con sesión */}
        <Tab.Screen name="Configuración">
          {(props) => <SettingsScreen {...props} session={session} />}
        </Tab.Screen>
        
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}