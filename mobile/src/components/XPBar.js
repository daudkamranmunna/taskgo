// The level and XP bar. It only DISPLAYS what GET /api/stats/xp returned:
// xp = { xp, level, xp_into_level, xp_for_next_level, progress }
// showHelp: also explains how XP is earned (used on the Profile screen).
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { colors, fontSize, radius, spacing } from '../constants/theme';

export default function XPBar({ xp, showHelp = false }) {
  // Make sure the bar width is always between 0% and 100%
  const percent = Math.round(Math.min(1, Math.max(0, xp.progress)) * 100);

  return (
    <Card>
      <View style={styles.topRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{xp.level}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Level {xp.level}</Text>
          <Text style={styles.sub}>{xp.xp} XP in total</Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.caption}>
        {xp.xp_into_level} / {xp.xp_for_next_level} XP to reach level {xp.level + 1}
      </Text>

      {showHelp ? (
        <Text style={styles.help}>
          How to earn XP: 1 XP for every minute you study, 10 XP for every active day
          (10 minutes or more), 15 XP for every task you finish, and 25 XP for every badge.
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: { color: colors.white, fontSize: 24, fontWeight: '800' },
  titleBlock: { marginLeft: spacing.md },
  title: { fontSize: fontSize.title, fontWeight: '800', color: colors.text },
  sub: { fontSize: fontSize.small, color: colors.muted },
  track: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  caption: { marginTop: spacing.sm, fontSize: fontSize.small, color: colors.muted },
  help: {
    marginTop: spacing.md,
    fontSize: fontSize.small,
    color: colors.muted,
    lineHeight: 19,
  },
});