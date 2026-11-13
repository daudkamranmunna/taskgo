// Keeps track of who is logged in and offers signUp / signIn / signOut.
// Screens use it through the useAuth() hook:  const { user, signIn } = useAuth();
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Turns a technical Supabase error into a short message a student can understand
function friendlyError(error) {
  const code = error.code || '';
  const message = (error.message || '').toLowerCase();

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'Wrong email or password. Please try again.';
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (code === 'weak_password' || message.includes('password should be')) {
    return 'That password is too weak. Please use at least 6 characters.';
  }
  if (
    code === 'email_address_invalid' ||
    message.includes('invalid format') ||
    message.includes('email address is invalid')
  ) {
    return 'Please enter a valid email address.';
  }
  if (code.includes('rate_limit') || message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (
    message.includes('network request failed') ||
    error.name === 'AuthRetryableFetchError'
  ) {
    return 'Could not reach the server. Please check your internet connection.';
  }

  // Unknown problem: keep the details in the console for us, show a calm message
  console.warn('Auth error:', error);
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // true until we have checked whether a login is saved on the phone
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1. Load the login saved on the phone (if any)
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch((err) => console.warn('Could not read saved session:', err))
      .finally(() => setInitializing(false));

    // 2. Stay up to date: runs on login, logout and when the token is renewed
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Each function returns { error }: null when it worked, otherwise a message to show.

  async function signUp(displayName, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // display_name is read by the database trigger to create the profile
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) return { error: friendlyError(error) };

    // With email confirmation switched off, a session comes back right away
    if (!data.session) {
      return {
        error:
          'Your account was created, but Supabase is still asking for email confirmation. Turn it off in the Supabase dashboard (Authentication > Sign In / Providers).',
      };
    }
    return { error: null };
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error ? friendlyError(error) : null };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error: error ? friendlyError(error) : null };
  }

  const value = {
    session,
    user: session ? session.user : null,
    initializing,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook screens use to read the login state
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}