// History screen: all study sessions, grouped by day with the day's total.
// Opened from the Progress screen. Delete a session with the trash icon.
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../src/components/ScreenContainer';
import Card from '../src/components/Card';
import Button from '../src/components/Button';
import EmptyState from '../src/components/EmptyState';
import LoadingView from '../src/components/LoadingView';
import SessionItem from '../src/components/SessionItem';
import { api } from '../src/lib/api';
import { formatShortDate, shortWeekday, todayString } from '../src/utils/date';
import { formatMinutes } from '../src/utils/format';
import { colors, fontSize, radius, spacing } from '../src/constants/theme';

const PAGE_SIZE = 50;

// Yesterday's date on the phone, as "YYYY-MM-DD"
function yesterdayString() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return todayString(date);
}

// Heading for a day: "Today", "Yesterday" or "Mon, Nov 9"
function dateLabel(date) {
  if (date === todayString()) return 'Today';
  if (date === yesterdayString()) return 'Yesterday';
  return `${shortWeekday(date)}, ${formatShortDate(date)}`;
}

// Turns the flat list (already newest first) into days:
// [{ date, totalSeconds, items: [session, ...] }, ...]
function groupByDate(sessions) {
  const groups = [];
  for (const session of sessions) {
    const last = groups[groups.length - 1];
    if (last && last.date === session.session_date) {
      last.items.push(session);
      last.totalSeconds += session.duration_seconds;
    } else {
      groups.push({
        date: session.session_date,
        totalSeconds: session.duration_seconds,
        items: [session],
      });
    }
  }
  return groups;
}

export default function History() {
  const router = useRouter();
  const [sessions, setSessions] = useState(null); // null = not loaded yet
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const rows = await api.getSessions(PAGE_SIZE, 0);
      setSessions(rows);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  function retry() {
    setLoading(true);
    load();
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const rows = await api.getSessions(PAGE_SIZE, sessions.length);
      setSessions((current) => [...current, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      Alert.alert('Could not load more', err.message);
    }
    setLoadingMore(false);
  }

  function confirmDelete(session) {
    const minutes = formatMinutes(Math.floor(session.duration_seconds / 60));
    Alert.alert(
      'Delete this session?',
      `${minutes} of ${session.subject} will be removed from your history and your totals.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session) },
      ]
    );
  }

  async function deleteSession(session) {
    try {
      await api.deleteSession(session.id);
      setSessions((current) => current.filter((s) => s.id !== session.id));
    } catch (err) {
      Alert.alert('Could not delete the session', err.message);
    }
  }

  // ----- the header with a back arrow -----
  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={30} color={colors.text} />
      </Pressable>
      <Text style={styles.heading}>Study history</Text>
    </View>
  );

  // ----- what to show in the middle -----
  let content;
  if (loading && sessions === null) {
    content = <LoadingView message="Loading your history... (the free server can take up to a minute to wake up)" />;
  } else if (error && sessions === null) {
    content = (
      <Card>
        <EmptyState
          icon="cloud-offline-outline"
          title="Could not load your history"
          message={error}
          actionLabel="Try again"
          onAction={retry}
        />
      </Card>
    );
  } else if (sessions.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon="time-outline"
          title="No study sessions yet"
          message="Finish a session on the Timer and it will show up here."
          actionLabel="Start studying"
          onAction={() => router.replace('/(tabs)/timer')}
        />
      </Card>
    );
  } else {
    content = (
      <>
        {groupByDate(sessions).map((group) => (
          <Card key={group.date}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{dateLabel(group.date)}</Text>
              <Text style={styles.dayTotal}>
                {formatMinutes(Math.floor(group.totalSeconds / 60))}
              </Text>
            </View>
            {group.items.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                onDelete={() => confirmDelete(session)}
              />
            ))}
          </Card>
        ))}

        {hasMore ? (
          <Button
            title="Load more"
            variant="secondary"
            onPress={loadMore}
            loading={loadingMore}
          />
        ) : null}
      </>
    );
  }

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={handleRefresh}
      edges={['top', 'bottom']}
    >
      {header}

      {/* A failed refresh keeps the old list and shows a small warning */}
      {error && sessions !== null ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Could not refresh: {error}</Text>
        </View>
      ) : null}

      {content}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  heading: {
    marginLeft: spacing.sm,
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
  },
  banner: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { color: colors.danger, fontSize: fontSize.small },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dayTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  dayTotal: { fontSize: fontSize.body, fontWeight: '800', color: colors.primary },
});