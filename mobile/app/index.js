// The first screen. It only decides where to send you.
import { Redirect } from 'expo-router';
import ScreenContainer from '../src/components/ScreenContainer';
import LoadingView from '../src/components/LoadingView';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { session, initializing } = useAuth();

  // Still checking if a login is saved on the phone
  if (initializing) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingView message="Starting TaskGo..." />
      </ScreenContainer>
    );
  }

  return <Redirect href={session ? '/(tabs)/home' : '/(auth)/login'} />;
}