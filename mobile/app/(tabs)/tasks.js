// PLACEHOLDER. The real Tasks screen is built in Step 9.
import { Text } from 'react-native';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import EmptyState from '../../src/components/EmptyState';
import { colors, fontSize } from '../../src/constants/theme';

export default function Tasks() {
  return (
    <ScreenContainer>
      <Text style={{ fontSize: fontSize.heading, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
        Tasks
      </Text>
      <Card>
        <EmptyState
          icon="checkbox-outline"
          title="Tasks"
          message="Your tasks and deadlines will show up here (Step 9)."
        />
      </Card>
    </ScreenContainer>
  );
}