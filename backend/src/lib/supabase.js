// Creates the Supabase connections used by the backend.
// We only ever use the publishable ("anon") key, never the secret key.
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

// A server has no browser to remember logins, so turn session saving off
const serverAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
};

// A plain connection with no user. Used only to check a token is real.
export function createAnonClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: serverAuthOptions,
  });
}

// A connection that acts as one logged-in user: it sends that user's token,
// so Row Level Security only lets it see and change that user's own rows.
export function createUserClient(token) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: serverAuthOptions,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}