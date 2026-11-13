// PLACEHOLDER. The real Timer screen is built in Step 10.
import { Text } from 'react-native';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import EmptyState from '../../src/components/EmptyState';
import { colors, fontSize } from '../../src/constants/theme';

export default function Timer() {
  return (
    <ScreenContainer>
      <Text style={{ fontSize: fontSize.heading, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
        Timer
      </Text>
      <Card>
        <EmptyState
          icon="timer-outline"
          title="Timer"
          message="The study timer with the ringing alarm will live here (Step 10)."
        />
      </Card>
    </ScreenContainer>
  );
}