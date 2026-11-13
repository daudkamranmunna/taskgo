// PLACEHOLDER. The real Profile screen is built in Step 8.
import { Text } from 'react-native';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import EmptyState from '../../src/components/EmptyState';
import { colors, fontSize } from '../../src/constants/theme';

export default function Profile() {
  return (
    <ScreenContainer>
      <Text style={{ fontSize: fontSize.heading, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
        Profile
      </Text>
      <Card>
        <EmptyState
          icon="person-outline"
          title="Profile"
          message="Your name, daily goal and logout will live here (Step 8)."
        />
      </Card>
    </ScreenContainer>
  );
}