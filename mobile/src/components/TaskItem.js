// One task in the list: checkbox, title, subject, priority, note preview,
// deadline label, Start button and delete icon.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { deadlineLabel, isOverdue } from '../utils/date';
import { colors, fontSize, radius, spacing } from '../constants/theme';

const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', exam: 'Exam' };

// Red when overdue, orange when due today or tomorrow, gray otherwise
function deadlineColor(daysLeft) {
  if (isOverdue(daysLeft)) return colors.danger;
  if (daysLeft !== null && daysLeft <= 1) return colors.accent;
  return colors.muted;
}

export default function TaskItem({
  task,
  busy = false, // true while the checkbox is being saved
  onToggle,
  onPress, // tap the task to edit it
  onDelete,
  onStart,
}) {
  const priorityColor = colors.priority[task.priority] || colors.muted;
  const label = task.is_done ? null : deadlineLabel(task.days_left);

  return (
    <Card style={[styles.card, task.is_done && styles.doneCard]}>
      <View style={styles.topRow}>
        <Pressable
          onPress={onToggle}
          disabled={busy}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.is_done }}
          style={busy && styles.busy}
        >
          <Ionicons
            name={task.is_done ? 'checkbox' : 'square-outline'}
            size={28}
            color={task.is_done ? colors.success : colors.muted}
          />
        </Pressable>

        <Pressable style={styles.titleArea} onPress={onPress}>
          <Text
            style={[styles.title, task.is_done && styles.titleDone]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </Pressable>

        <Pressable onPress={onDelete} hitSlop={10} accessibilityLabel="Delete task">
          <Ionicons name="trash-outline" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <Pressable onPress={onPress} style={styles.details}>
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.chipText, { color: colors.primary }]}>{task.subject}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: `${priorityColor}22` }]}>
            <Text style={[styles.chipText, { color: priorityColor }]}>
              {PRIORITY_LABELS[task.priority] || task.priority}
            </Text>
          </View>
        </View>

        {task.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {task.note}
          </Text>
        ) : null}
      </Pressable>

      <View style={styles.bottomRow}>
        <Text style={[styles.deadline, { color: deadlineColor(task.days_left) }]}>
          {label || ''}
        </Text>
        {!task.is_done ? (
          <Pressable onPress={onStart} style={styles.startButton} accessibilityLabel="Start studying this task">
            <Ionicons name="play" size={14} color={colors.white} />
            <Text style={styles.startText}>Start</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md, paddingVertical: spacing.md },
  doneCard: { opacity: 0.65 },
  busy: { opacity: 0.4 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  titleArea: { flex: 1, marginHorizontal: spacing.md },
  title: { fontSize: fontSize.body, fontWeight: '700', color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.muted },
  details: { marginLeft: 28 + spacing.md, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  note: {
    marginTop: 2,
    fontSize: fontSize.small,
    color: colors.muted,
    fontStyle: 'italic',
  },
  bottomRow: {
    marginLeft: 28 + spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deadline: { flex: 1, fontSize: fontSize.small, fontWeight: '700' },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  startText: { marginLeft: 4, color: colors.white, fontSize: 13, fontWeight: '700' },
});