// The one place where the app connects to Supabase (login, register, logout).
// All other files import { supabase } from here.
import 'react-native-url-polyfill/auto'; // makes web addresses work on phones
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage, // saves the login on the phone, so it survives restarts
    persistSession: true,
    autoRefreshToken: true, // renews the login token before it expires
    detectSessionInUrl: false, // not needed in a mobile app
  },
});

// Only renew the token while the app is on screen (saves battery)
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});