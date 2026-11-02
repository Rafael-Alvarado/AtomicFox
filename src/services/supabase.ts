import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🦊 Reemplaza con tus credenciales reales de tu proyecto en Supabase
const SUPABASE_URL = 'https://elnfojufbchoyrlcjcjw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AQ4pfUHO0n-1Xnl1WxdNXg_8nbE2N7d';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});