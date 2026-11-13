// Home screen: greeting, streak, today's goal ring, deadlines and a quote.
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import EmptyState from '../../src/components/EmptyState';
import LoadingView from '../../src/components/LoadingView';
import ProgressRing from '../../src/components/ProgressRing';
import StreakCard from '../../src/components/StreakCard';
import DeadlineCard from '../../src/components/DeadlineCard';
import { api } from '../../src/lib/api';
import { todayString } from '../../src/utils/date';
import { formatMinutes } from '../../src/utils/format';
import { colors, fontSize, spacing } from '../../src/constants/theme';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  // The quote only changes on first load and on pull-to-refresh, not on every visit
  const quoteRef = useRef(null);

  const load = useCallback(async (newQuote) => {
    setError('');
    const today = todayString(); // the phone's own date, sent to the backend
    const wantQuote = newQuote || quoteRef.current === null;

    const [profile, stats, streak, upcoming, quote] = await Promise.allSettled([
      api.getProfile(),
      api.getTodayStats(today),
      api.getStreak(today),
      api.getUpcomingTasks(today),
      wantQuote ? api.getRandomQuote() : Promise.resolve(quoteRef.current),
    ]);

    // Profile, today's stats and the streak are essential. The rest is optional.
    const essentialFailure = [profile, stats, streak].find((r) => r.status === 'rejected');
    if (essentialFailure) {
      setError(essentialFailure.reason.message || 'Something went wrong.');
    } else {
      if (quote.status === 'fulfilled') quoteRef.current = quote.value;
      setData({
        profile: profile.value,
        stats: stats.value,
        streak: streak.value,
        upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
        quote: quoteRef.current,
      });
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  // Reload every time this tab comes into view (so new sessions show up)
  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  function handleRefresh() {
    setRefreshing(true);
    load(true);
  }

  function retry() {
    setLoading(true);
    load(false);
  }

  // First load: nothing to show yet
  if (loading && !data) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingView message="Loading your day... (the free server can take up to a minute to wake up)" />
      </ScreenContainer>
    );
  }

  // Could not load and we have nothing to show
  if (error && !data) {
    return (
      <ScreenContainer>
        <Text style={styles.heading}>Home</Text>
        <Card>
          <EmptyState
            icon="cloud-offline-outline"
            title="Could not load Home"
            message={error}
            actionLabel="Try again"
            onAction={retry}
          />
        </Card>
      </ScreenContainer>
    );
  }

  const { profile, stats, streak, upcoming, quote } = data;
  const progress = stats.goal_minutes > 0 ? stats.minutes_today / stats.goal_minutes : 0;
  const minutesLeft = Math.max(0, stats.goal_minutes - stats.minutes_today);

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      {/* A failed refresh keeps the old numbers and shows a small warning */}
      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Could not refresh: {error}</Text>
        </View>
      ) : null}

      <Text style={styles.greeting}>{greeting()},</Text>
      <Text style={styles.name} numberOfLines={1}>
        {profile.display_name || 'Student'}
      </Text>

      <StreakCard
        current={streak.current_streak}
        longest={streak.longest_streak}
        activeToday={streak.active_today}
      />

      <Card style={styles.goalCard}>
        <Text style={styles.cardTitle}>Today's goal</Text>
        <View style={styles.ringWrap}>
          <ProgressRing progress={progress} size={170}>
            <Text style={styles.ringValue}>{formatMinutes(stats.minutes_today)}</Text>
            <Text style={styles.ringSub}>of {formatMinutes(stats.goal_minutes)}</Text>
          </ProgressRing>
        </View>
        <Text style={[styles.goalMessage, stats.goal_met && { color: colors.success }]}>
          {stats.goal_met
            ? 'Goal reached! Great work.'
            : `${formatMinutes(minutesLeft)} to go`}
        </Text>
        <Text style={styles.sessions}>
          {stats.sessions_today} {stats.sessions_today === 1 ? 'session' : 'sessions'} today
        </Text>
      </Card>

      <Button
        title="Start Studying"
        onPress={() => router.push('/(tabs)/timer')}
        style={styles.startButton}
      />

      {/* Step 9 will make a tap open the task. For now it opens the Tasks tab. */}
      <DeadlineCard tasks={upcoming} onTaskPress={() => router.push('/(tabs)/tasks')} />

      {quote ? (
        <Card>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          {quote.author ? <Text style={styles.quoteAuthor}>{quote.author}</Text> : null}
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  banner: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { color: colors.danger, fontSize: fontSize.small },
  greeting: { fontSize: fontSize.body, color: colors.muted },
  name: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  goalCard: { alignItems: 'center' },
  cardTitle: {
    alignSelf: 'flex-start',
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  ringWrap: { marginVertical: spacing.lg },
  ringValue: { fontSize: 32, fontWeight: '800', color: colors.text },
  ringSub: { fontSize: fontSize.body, color: colors.muted },
  goalMessage: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.primary,
  },
  sessions: { marginTop: spacing.xs, fontSize: fontSize.small, color: colors.muted },
  startButton: { marginBottom: spacing.lg },
  quoteText: {
    fontSize: fontSize.body,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 24,
  },
  quoteAuthor: { marginTop: spacing.sm, fontSize: fontSize.small, color: colors.muted },
});