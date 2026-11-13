// Shows up to 3 upcoming deadlines (from GET /api/tasks/upcoming).
// Each task already has days_left, calculated by the backend.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import { deadlineLabel, isOverdue } from '../utils/date';
import { colors, fontSize, spacing } from '../constants/theme';

// Red when overdue, orange when due today or tomorrow, gray otherwise
function labelColor(daysLeft) {
  if (isOverdue(daysLeft)) return colors.danger;
  if (daysLeft <= 1) return colors.accent;
  return colors.muted;
}

export default function DeadlineCard({ tasks = [], onTaskPress }) {
  return (
    <Card>
      <Text style={styles.title}>Upcoming deadlines</Text>

      {tasks.length === 0 ? (
        <Text style={styles.empty}>
          No deadlines coming up. Add a due date to a task and it will show here.
        </Text>
      ) : (
        tasks.map((task) => (
          <Pressable
            key={task.id}
            onPress={() => onTaskPress && onTaskPress(task)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: colors.priority[task.priority] || colors.muted },
              ]}
            />
            <View style={styles.text}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {task.title}
              </Text>
              <Text style={styles.subject} numberOfLines={1}>
                {task.subject}
              </Text>
            </View>
            <Text style={[styles.label, { color: labelColor(task.days_left) }]}>
              {deadlineLabel(task.days_left)}
            </Text>
          </Pressable>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  empty: { fontSize: fontSize.body, color: colors.muted, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  text: { flex: 1, marginRight: spacing.sm },
  taskTitle: { fontSize: fontSize.body, fontWeight: '600', color: colors.text },
  subject: { fontSize: fontSize.small, color: colors.muted, marginTop: 2 },
  label: { fontSize: fontSize.small, fontWeight: '700' },
});