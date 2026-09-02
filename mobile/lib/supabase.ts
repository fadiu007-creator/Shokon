import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// These are the public Supabase client values protected by RLS.
// Environment variables can still override them for other deployments.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://xnpfgsjgfmryurcpyclt.supabase.co';
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_SLz0RAn6oHfTxYs3KJWBRw_cI3oEqzH';

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function requireSupabase() {
  return supabase;
}
