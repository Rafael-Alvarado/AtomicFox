import React from 'react';
import { HabitsProvider } from './src/context/HabitsContext';
// ... tus otras importaciones de navegación
import AppNavigator from './src/navigation/AppNavigator'; // O tu estructura actual de navegación

export default function App() {
  return (
    <HabitsProvider>
      <AppNavigator />
    </HabitsProvider>
  );
}