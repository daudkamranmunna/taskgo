// The big streak card on Home: flame, current streak, longest streak.
// It only DISPLAYS numbers. The backend calculates the streak.
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors, fontSize, spacing } from '../constants/theme';

function days(count) {
  return `${count} ${count === 1 ? 'day' : 'days'}`;
}

// minMinutes is only used for the message text. The backend decides what counts.
export default function StreakCard({ current, longest, activeToday, minMinutes = 10 }) {
  let message;
  if (activeToday) {
    message = 'You studied today. Your streak is safe!';
  } else if (current > 0) {
    message = `Study at least ${minMinutes} minutes today to keep your streak alive.`;
  } else {
    message = `Study ${minMinutes} minutes today to start a streak.`;
  }

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name="flame"
          size={64}
          color={current > 0 ? colors.accent : 'rgba(255,255,255,0.45)'}
        />
        <View style={styles.numbers}>
          <Text style={styles.big}>{current}</Text>
          <Text style={styles.label}>{current === 1 ? 'day streak' : 'day streak'}</Text>
        </View>
        <View style={styles.best}>
          <Text style={styles.bestLabel}>Longest</Text>
          <Text style={styles.bestValue}>{days(longest)}</Text>
        </View>
      </View>
      <Text style={styles.message}>{message}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center' },
  numbers: { flex: 1, marginLeft: spacing.md },
  big: { fontSize: 48, fontWeight: '800', color: colors.white, lineHeight: 54 },
  label: { fontSize: fontSize.body, color: 'rgba(255,255,255,0.85)' },
  best: { alignItems: 'flex-end' },
  bestLabel: { fontSize: fontSize.small, color: 'rgba(255,255,255,0.75)' },
  bestValue: { fontSize: fontSize.body, fontWeight: '700', color: colors.white },
  message: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: 'rgba(255,255,255,0.9)',
  },
});