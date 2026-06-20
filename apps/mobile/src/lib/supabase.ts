/**
 * Supabase client (FND-005 client side).
 *
 * Uses expo-secure-store for the auth session so tokens are kept in the device
 * keychain/keystore, not plain AsyncStorage. RLS on the backend is the real guard;
 * the anon key here is public by design.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { env } from '../config/env';

/** SecureStore-backed storage adapter for the Supabase auth session. */
const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// SecureStore is unavailable on web; fall back to AsyncStorage there.
const storage = Platform.OS === 'web' ? AsyncStorage : secureStorage;

// The app is offline-first and usable in guest mode, so it must construct a client
// even when no backend is configured. createClient() throws on an empty URL, so we
// fall back to a harmless local placeholder; with no real backend + no session,
// all sync operations simply no-op until a project is configured via env.
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  env.supabaseUrl || 'http://localhost:54321',
  env.supabaseAnonKey || 'anon-placeholder',
  {
    auth: {
      storage,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
