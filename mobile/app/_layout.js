// Root layout: wraps every screen and guards the routes.
//   (tabs) and task-form are only reachable when logged in
//   (auth) is only reachable when logged out
// While we are still checking for a saved login (initializing), both are
// closed, so only the start screen (index) shows its spinner.
// Later screens (history, badges) must be added to the logged-in group too.
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootNavigator() {
  const { session, initializing } = useAuth();
  const loggedIn = !initializing && !!session;
  const loggedOut = !initializing && !session;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={loggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="task-form" />
      </Stack.Protected>

      <Stack.Protected guard={loggedOut}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}