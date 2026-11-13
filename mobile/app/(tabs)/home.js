// PLACEHOLDER. The real Home screen is built in Step 8.
import { Text } from 'react-native';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import EmptyState from '../../src/components/EmptyState';
import { colors, fontSize } from '../../src/constants/theme';

export default function Home() {
  return (
    <ScreenContainer>
      <Text style={{ fontSize: fontSize.heading, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
        Home
      </Text>
      <Card>
        <EmptyState
          icon="home-outline"
          title="Home"
          message="Your streak, daily goal and deadlines will show up here (Step 8)."
        />
      </Card>
    </ScreenContainer>
  );
}