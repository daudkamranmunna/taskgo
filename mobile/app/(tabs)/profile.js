// PLACEHOLDER. The real Profile screen is built in Step 8.
// For now it shows who is logged in and has a Log out button.
import { Alert, Text } from 'react-native';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import EmptyState from '../../src/components/EmptyState';
import { useAuth } from '../../src/context/AuthContext';
import { colors, fontSize } from '../../src/constants/theme';

export default function Profile() {
  const { user, signOut } = useAuth();

  // Ask first, so nobody logs out by accident
  function confirmLogout() {
    Alert.alert('Log out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <ScreenContainer>
      <Text style={{ fontSize: fontSize.heading, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
        Profile
      </Text>
      <Card>
        <EmptyState
          icon="person-outline"
          title={user ? user.email : 'Profile'}
          message="Your name and daily goal will live here (Step 8)."
        />
      </Card>
      <Button title="Log out" variant="danger" onPress={confirmLogout} />
    </ScreenContainer>
  );
}