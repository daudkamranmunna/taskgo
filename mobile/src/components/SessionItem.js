// One study session in the History list: subject, time, length,
// the linked task title (if any), the note (if any) and a delete icon.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMinutes } from '../utils/format';
import { colors, fontSize, radius, spacing } from '../constants/theme';

// "2026-11-12T08:30:00Z" -> "2:30 PM" (in the phone's own time zone)
function timeLabel(startedAt) {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function SessionItem({ session, onDelete }) {
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <View style={styles.topLine}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{session.subject}</Text>
          </View>
          <Text style={styles.time}>{timeLabel(session.started_at)}</Text>
        </View>

        {session.task_title ? (
          <View style={styles.taskLine}>
            <Ionicons name="checkbox-outline" size={14} color={colors.muted} />
            <Text style={styles.taskText} numberOfLines={1}>
              {session.task_title}
            </Text>
          </View>
        ) : null}

        {session.note ? <Text style={styles.note}>{session.note}</Text> : null}
      </View>

      <View style={styles.side}>
        <Text style={styles.duration}>
          {formatMinutes(Math.floor(session.duration_seconds / 60))}
        </Text>
        <Pressable onPress={onDelete} hitSlop={10} accessibilityLabel="Delete session">
          <Ionicons name="trash-outline" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  main: { flex: 1, marginRight: spacing.md },
  topLine: { flexDirection: 'row', alignItems: 'center' },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: spacing.sm,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  time: { fontSize: fontSize.small, color: colors.muted },
  taskLine: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  taskText: { flex: 1, marginLeft: 4, fontSize: fontSize.small, color: colors.muted },
  note: {
    marginTop: 6,
    fontSize: fontSize.small,
    color: colors.text,
    fontStyle: 'italic',
  },
  side: { alignItems: 'flex-end', justifyContent: 'space-between' },
  duration: { fontSize: fontSize.body, fontWeight: '800', color: colors.text },
});