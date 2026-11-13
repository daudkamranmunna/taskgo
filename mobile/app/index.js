// The first screen the app opens. For now it jumps straight to the tabs.
// In Step 7 it will check if you are logged in and go to login or tabs.
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}