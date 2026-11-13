// PLACEHOLDER. The real Progress screen is built in Step 11.
import { Text } from 'react-native';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import EmptyState from '../../src/components/EmptyState';
import { colors, fontSize } from '../../src/constants/theme';

export default function Progress() {
  return (
    <ScreenContainer>
      <Text style={{ fontSize: fontSize.heading, fontWeight: '800', color: colors.text, marginBottom: 16 }}>
        Progress
      </Text>
      <Card>
        <EmptyState
          icon="stats-chart-outline"
          title="Progress"
          message="Your weekly chart and streak calendar will show up here (Step 11)."
        />
      </Card>
    </ScreenContainer>
  );
}