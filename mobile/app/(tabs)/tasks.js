// Tasks screen: your open and finished tasks, with deadlines.
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import EmptyState from '../../src/components/EmptyState';
import LoadingView from '../../src/components/LoadingView';
import TaskItem from '../../src/components/TaskItem';
import BadgePopup from '../../src/components/BadgePopup';
import { api } from '../../src/lib/api';
import { todayString } from '../../src/utils/date';
import { taskFormHref, timerHref } from '../../src/utils/format';
import { colors, fontSize, radius, shadow, spacing } from '../../src/constants/theme';

export default function Tasks() {
  const router = useRouter();
  const [status, setStatus] = useState('open'); // 'open' or 'done'
  const [tasks, setTasks] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null); // task whose checkbox is saving
  const [newBadges, setNewBadges] = useState([]); // badges to celebrate

  const load = useCallback(async () => {
    setError('');
    try {
      setTasks(await api.getTasks(status, todayString()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [status]);

  // Load when the tab comes into view, and again when the filter changes
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function changeStatus(next) {
    if (next === status) return;
    setTasks(null);
    setLoading(true);
    setStatus(next);
  }

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  function retry() {
    setLoading(true);
    load();
  }

  // Tick or un-tick a task. The backend sets done_at and checks for badges.
  async function toggleTask(task) {
    setBusyId(task.id);
    try {
      const result = await api.updateTask(task.id, { is_done: !task.is_done });
      // The task now belongs to the other tab, so remove it from this list
      setTasks((current) => current.filter((t) => t.id !== task.id));
      if (result.newly_earned_badges.length > 0) {
        setNewBadges(result.newly_earned_badges);
      }
    } catch (err) {
      Alert.alert('Could not update the task', err.message);
    } finally {
      setBusyId(null);
    }
  }

  function confirmDelete(task) {
    Alert.alert(
      'Delete this task?',
      `"${task.title}" will be deleted. Your study sessions are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task) },
      ]
    );
  }

  async function deleteTask(task) {
    try {
      await api.deleteTask(task.id);
      setTasks((current) => current.filter((t) => t.id !== task.id));
    } catch (err) {
      Alert.alert('Could not delete the task', err.message);
    }
  }

  // ----- what to show in the middle of the screen -----
  let content;
  if (loading && tasks === null) {
    content = (
      <LoadingView message="Loading your tasks... (the free server can take up to a minute to wake up)" />
    );
  } else if (error && tasks === null) {
    content = (
      <Card>
        <EmptyState
          icon="cloud-offline-outline"
          title="Could not load your tasks"
          message={error}
          actionLabel="Try again"
          onAction={retry}
        />
      </Card>
    );
  } else if (tasks.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon={status === 'open' ? 'checkmark-done-outline' : 'time-outline'}
          title={status === 'open' ? 'No open tasks' : 'Nothing finished yet'}
          message={
            status === 'open'
              ? 'Tap the + button to add your first task.'
              : 'Tasks you finish will show up here.'
          }
        />
      </Card>
    );
  } else {
    content = tasks.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        busy={busyId === task.id}
        onToggle={() => toggleTask(task)}
        onPress={() => router.push(taskFormHref(task))}
        onDelete={() => confirmDelete(task)}
        onStart={() => router.push(timerHref(task))}
      />
    ));
  }

  return (
    <View style={styles.root}>
      <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh} style={styles.content}>
        <Text style={styles.heading}>Tasks</Text>

        {/* Open / Done filter */}
        <View style={styles.tabs}>
          {['open', 'done'].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => changeStatus(tab)}
              style={[styles.tab, status === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, status === tab && styles.tabTextActive]}>
                {tab === 'open' ? 'Open' : 'Done'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* A failed refresh keeps the old list and shows a small warning */}
        {error && tasks !== null ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Could not refresh: {error}</Text>
          </View>
        ) : null}

        {content}
      </ScreenContainer>

      {/* The + button (opens the add form, built in Part 2) */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/task-form')}
        accessibilityLabel="Add a task"
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>

      <BadgePopup badges={newBadges} onClose={() => setNewBadges([])} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 100 }, // room so the + button never covers the last task
  heading: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm + 2,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: fontSize.body, fontWeight: '700', color: colors.primary },
  tabTextActive: { color: colors.white },
  banner: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { color: colors.danger, fontSize: fontSize.small },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
});