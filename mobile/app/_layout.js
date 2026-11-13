// Root layout: the frame that wraps every screen of the app.
// Later (Step 7) the login check will be added here.
import { Stack } from 'expo-router';

export default function RootLayout() {
  // headerShown: false hides the default top bar, we design our own
  return <Stack screenOptions={{ headerShown: false }} />;
}