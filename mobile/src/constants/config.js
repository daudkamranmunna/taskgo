// App settings. The EXPO_PUBLIC_ values come from mobile/.env (created in Step 7).
// Expo copies them into the app when it starts, so after changing .env
// restart with: npx expo start -c

export const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const APP_NAME = 'TaskGo';
export const APP_VERSION = '1.0.0';