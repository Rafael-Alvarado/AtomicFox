import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native'; // 👈 1. Importar AppState
import { supabase } from '../services/supabase'; // 👈 2. Importar supabase para actualizar la nube

export interface Habit {
  id: string;
  name: string;
  identity: string;
  twoMinute: string;
  time: string;
  progress: number;
  streak: string;
  streakCount?: number;
}

interface HabitsContextData {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>; 
  userLevel: number;
  maxSlots: number;
  weeklyHistory: Record<string, number>;
  isDarkMode: boolean; 
  toggleTheme: () => void; 
  addHabit: (habit: Omit<Habit, 'id' | 'progress' | 'streak' | 'streakCount'>) => boolean;
  completeHabit: (id: string) => void;
  resetFactoryData: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextData>({} as HabitsContextData);

const STORAGE_KEY_HABITS = '@AtomicFox_habits';
const STORAGE_KEY_LEVEL = '@AtomicFox_userLevel';
const STORAGE_KEY_DATE = '@AtomicFox_lastDate';
const STORAGE_KEY_HISTORY = '@AtomicFox_weeklyHistory';
const STORAGE_KEY_THEME = '@AtomicFox_isDarkMode';

export const HabitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLevel, setUserLevel] = useState(1);
  const maxSlots = userLevel === 1 ? 2 : 5;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyHistory, setWeeklyHistory] = useState<Record<string, number>>({});
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = async () => {
    try {
      const nextTheme = !isDarkMode;
      setIsDarkMode(nextTheme);
      await AsyncStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(nextTheme));
    } catch (error) {
      console.error("Error al guardar el tema:", error);
    }
  };

  const saveDailyProgressToHistory = async (currentHabits: Habit[], historyState: Record<string, number>) => {
    if (currentHabits.length === 0) return;
    
    const avg = Math.round(currentHabits.reduce((acc, h) => acc + h.progress, 0) / currentHabits.length);
    const currentDateKey = new Date().toDateString();

    const updatedHistory = {
      ...historyState,
      [currentDateKey]: avg,
    };

    setWeeklyHistory(updatedHistory);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error al guardar historial diario:", error);
    }
  };

  // 🦊 Función centralizada para verificar y reiniciar el día
  const checkAndResetDay = async (currentHabits: Habit[]) => {
    try {
      const storedDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);
      const currentDate = new Date().toDateString();

      if (storedDate && storedDate !== currentDate) {
        // Es un nuevo día: Reiniciamos el progreso localmente a 0
        const resetHabits = currentHabits.map((habit) => ({
          ...habit,
          progress: 0,
        }));

        setHabits(resetHabits);
        await AsyncStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(resetHabits));
        await AsyncStorage.setItem(STORAGE_KEY_DATE, currentDate);

        // Opcional: Actualizar también en Supabase para que el progreso del día comience en 0 en la nube
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await supabase
            .from('habits')
            .update({ progress: 0 })
            .eq('user_id', session.user.id);
        }

        console.log("¡Nuevo día detectado! Hábitos reiniciados a 0 para el registro diario.");
      } else if (!storedDate) {
        await AsyncStorage.setItem(STORAGE_KEY_DATE, currentDate);
      }
    } catch (error) {
      console.error("Error al verificar el cambio de día:", error);
    }
  };

  // Función para restablecer los datos de fábrica (local y Supabase)
    const resetFactoryData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await supabase
            .from('habits')
            .delete()
            .eq('user_id', session.user.id);
        }

        await AsyncStorage.clear();
        setHabits([]);
        setUserLevel(1);
        setWeeklyHistory({});
        setIsDarkMode(true);
        await AsyncStorage.setItem(STORAGE_KEY_DATE, new Date().toDateString());

        console.log("¡Datos de fábrica reiniciados correctamente!");
      } catch (error) {
        console.error("Error al reiniciar datos de fábrica:", error);
      }
    };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedHabits = await AsyncStorage.getItem(STORAGE_KEY_HABITS);
        const storedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        const storedHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEY_THEME);

        if (storedLevel) {
          setUserLevel(JSON.parse(storedLevel));
        }

        if (storedTheme !== null) {
          setIsDarkMode(JSON.parse(storedTheme));
        }

        if (storedHistory) {
          setWeeklyHistory(JSON.parse(storedHistory));
        }

        if (storedHabits) {
          let parsedHabits: Habit[] = JSON.parse(storedHabits);
          setHabits(parsedHabits);
          // Verificar si cambió el día al cargar
          await checkAndResetDay(parsedHabits);
        } else {
          setHabits([]);
          await AsyncStorage.setItem(STORAGE_KEY_DATE, new Date().toDateString());
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    loadStoredData();

    // 🦊 3. Escuchar cuando la app pasa a primer plano (ej. al despertar el cel al día siguiente)
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        const storedHabits = await AsyncStorage.getItem(STORAGE_KEY_HABITS);
        if (storedHabits) {
          checkAndResetDay(JSON.parse(storedHabits));
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
        await AsyncStorage.setItem(STORAGE_KEY_LEVEL, JSON.stringify(userLevel));
      } catch (error) {
        console.error("Error al guardar los datos:", error);
      }
    };

    if (habits.length > 0) {
      saveData();
    }
  }, [habits, userLevel]);

  const addHabit = (newHabitData: Omit<Habit, 'id' | 'progress' | 'streak' | 'streakCount'>): boolean => {
    if (habits.length >= maxSlots) {
      return false; 
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      ...newHabitData,
      progress: 0,
      streak: '0/7 días',
      streakCount: 0,
    };
    
    const updated = [newHabit, ...habits];
    setHabits(updated);
    saveDailyProgressToHistory(updated, weeklyHistory);
    return true;
  };
    
  const completeHabit = (id: string) => {
    setHabits((prev) => {
      const updatedHabits = prev.map((habit) => {
        if (habit.id === id) {
          if (habit.progress === 100) return habit;

          const nextStreakCount = (habit.streakCount || 0) + 1;
          return {
            ...habit,
            progress: 100,
            streakCount: nextStreakCount,
            streak: `${nextStreakCount}/7 días`,
          };
        }
        return habit;
      });

      const maxStreak = Math.max(...updatedHabits.map((h) => h.streakCount || 0), 0);
      if (maxStreak >= 7 && userLevel < 2) {
        setUserLevel(2);
      }

      saveDailyProgressToHistory(updatedHabits, weeklyHistory);
      return updatedHabits;
    });
  };

  return (
    <HabitsContext.Provider value={{ habits, setHabits, userLevel, maxSlots, weeklyHistory, isDarkMode, toggleTheme, addHabit, completeHabit , resetFactoryData }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => useContext(HabitsContext);