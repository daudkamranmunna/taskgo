// Reads the settings from backend/.env and checks that none are missing.
import dotenv from 'dotenv';

// quiet: true stops dotenv from printing extra messages
dotenv.config({ quiet: true });

// These two must exist, otherwise the server cannot talk to Supabase
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing environment variable: ${name}. Check backend/.env`);
    process.exit(1);
  }
}

// The rest of the code imports this object instead of reading process.env
export const env = {
  port: Number(process.env.PORT) || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
};