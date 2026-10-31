import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Habit {
  id: string;
  name: string;
  identity: string;
  twoMinute: string;
  time: string;
  progress: number;
  streak: string;
  streakCount: number;
}

interface HabitsContextData {
  habits: Habit[];
  userLevel: number;
  maxSlots: number;
  weeklyHistory: Record<string, number>;
  isDarkMode: boolean; // 👈 Nuevo: Estado global del tema
  toggleTheme: () => void; // 👈 Nuevo: Función para alternar el tema
  addHabit: (habit: Omit<Habit, 'id' | 'progress' | 'streak' | 'streakCount'>) => boolean;
  completeHabit: (id: string) => void;
}

const HabitsContext = createContext<HabitsContextData>({} as HabitsContextData);

const STORAGE_KEY_HABITS = '@AtomicFox_habits';
const STORAGE_KEY_LEVEL = '@AtomicFox_userLevel';
const STORAGE_KEY_DATE = '@AtomicFox_lastDate';
const STORAGE_KEY_HISTORY = '@AtomicFox_weeklyHistory';
const STORAGE_KEY_THEME = '@AtomicFox_isDarkMode'; // 👈 Nueva llave para persistir el tema

export const HabitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLevel, setUserLevel] = useState(1);
  const maxSlots = userLevel === 1 ? 2 : 5;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyHistory, setWeeklyHistory] = useState<Record<string, number>>({});
  
  // --- ESTADO GLOBAL DE TEMA (Día 15) ---
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

  // Guardar el progreso promedio del día actual en el historial persistente
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

  // Cargar datos al iniciar la app
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedHabits = await AsyncStorage.getItem(STORAGE_KEY_HABITS);
        const storedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        const storedDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);
        const storedHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEY_THEME); // 👈 Cargar tema guardado

        const currentDate = new Date().toDateString();

        if (storedLevel) {
          setUserLevel(JSON.parse(storedLevel));
        }

        if (storedTheme !== null) {
          setIsDarkMode(JSON.parse(storedTheme));
        }

        let loadedHistory: Record<string, number> = {};
        if (storedHistory) {
          loadedHistory = JSON.parse(storedHistory);
          setWeeklyHistory(loadedHistory);
        }

        if (storedHabits) {
          let parsedHabits: Habit[] = JSON.parse(storedHabits);

          // Reinicio diario si cambia la fecha
          if (storedDate !== currentDate) {
            parsedHabits = parsedHabits.map((habit) => ({
              ...habit,
              progress: 0,
            }));
            await AsyncStorage.setItem(STORAGE_KEY_DATE, currentDate);
          }

          setHabits(parsedHabits);
        } else {
          // Hábito por defecto inicial
          const initialHabits = [
            {
              id: '1',
              name: 'Meditación matutina',
              identity: 'Persona serena y enfocada',
              twoMinute: '10 mins de respiración',
              time: '6:30 AM',
              progress: 0,
              streak: '0/7 días',
              streakCount: 0,
            }
          ];
          setHabits(initialHabits);
          await AsyncStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(initialHabits));
          await AsyncStorage.setItem(STORAGE_KEY_DATE, currentDate);
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    loadStoredData();
  }, []);

  // Guardar hábitos y nivel en el storage local
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

          const nextStreakCount = habit.streakCount + 1;
          return {
            ...habit,
            progress: 100,
            streakCount: nextStreakCount,
            streak: `${nextStreakCount}/7 días`,
          };
        }
        return habit;
      });

      const maxStreak = Math.max(...updatedHabits.map((h) => h.streakCount), 0);
      if (maxStreak >= 7 && userLevel < 2) {
        setUserLevel(2);
      }

      saveDailyProgressToHistory(updatedHabits, weeklyHistory);
      return updatedHabits;
    });
  };

  return (
    <HabitsContext.Provider value={{ habits, userLevel, maxSlots, weeklyHistory, isDarkMode, toggleTheme, addHabit, completeHabit }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => useContext(HabitsContext);