// One badge in the grid. Earned: colored with the date. Locked: gray, with its requirement.
// badge comes from GET /api/badges: { code, name, description, icon, earned, earned_at }
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatShortDate, todayString } from '../utils/date';
import { colors, fontSize, radius, shadow, spacing } from '../constants/theme';

export default function BadgeItem({ badge }) {
  const earned = badge.earned;
  // earned_at is a timestamp; show it as the phone's local date
  const earnedDate =
    earned && badge.earned_at ? formatShortDate(todayString(new Date(badge.earned_at))) : null;

  return (
    <View style={[styles.card, !earned && styles.cardLocked]}>
      <View style={[styles.circle, earned ? styles.circleEarned : styles.circleLocked]}>
        <Ionicons name={badge.icon} size={34} color={earned ? colors.accent : '#9CA3AF'} />
      </View>

      <Text style={[styles.name, !earned && styles.nameLocked]} numberOfLines={2}>
        {badge.name}
      </Text>
      <Text style={styles.description}>{badge.description}</Text>

      {earned ? (
        <Text style={styles.earned}>{earnedDate ? `Earned ${earnedDate}` : 'Earned'}</Text>
      ) : (
        <View style={styles.lockedRow}>
          <Ionicons name="lock-closed" size={13} color={colors.muted} />
          <Text style={styles.lockedText}>Locked</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 200,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow,
  },
  cardLocked: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0 },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleEarned: { backgroundColor: colors.primaryLight },
  circleLocked: { backgroundColor: '#E5E7EB' },
  name: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  nameLocked: { color: colors.muted },
  description: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 17,
  },
  earned: {
    marginTop: 'auto',
    paddingTop: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  lockedRow: {
    marginTop: 'auto',
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedText: { marginLeft: 4, fontSize: 12, fontWeight: '700', color: colors.muted },
});