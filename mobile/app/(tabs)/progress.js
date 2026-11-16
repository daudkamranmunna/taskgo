// Progress screen: weekly chart, total / average / best day, and the 28-day calendar.
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import EmptyState from '../../src/components/EmptyState';
import LoadingView from '../../src/components/LoadingView';
import BarChart from '../../src/components/BarChart';
import StreakCalendar from '../../src/components/StreakCalendar';
import { api } from '../../src/lib/api';
import { formatShortDate, shortWeekday, todayString } from '../../src/utils/date';
import { formatMinutes } from '../../src/utils/format';
import { colors, fontSize, radius, spacing } from '../../src/constants/theme';

// One small number card (Total / Average / Best day)
function StatCard({ icon, label, value, sub }) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </Card>
  );
}

export default function Progress() {
  const router = useRouter();
  const [data, setData] = useState(null); // { weekly, streak }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const today = todayString(); // the phone's own date, sent to the backend
    try {
      const [weekly, streak] = await Promise.all([api.getWeekly(today), api.getStreak(today)]);
      setData({ weekly, streak });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time this tab comes into view (so new sessions show up)
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

  if (loading && !data) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingView message="Loading your progress... (the free server can take up to a minute to wake up)" />
      </ScreenContainer>
    );
  }

  if (error && !data) {
    return (
      <ScreenContainer>
        <Text style={styles.heading}>Progress</Text>
        <Card>
          <EmptyState
            icon="cloud-offline-outline"
            title="Could not load your progress"
            message={error}
            actionLabel="Try again"
            onAction={retry}
          />
        </Card>
      </ScreenContainer>
    );
  }

  const { weekly, streak } = data;
  const chartData = weekly.days.map((day, index) => ({
    label: shortWeekday(day.date),
    value: day.minutes,
    highlight: index === weekly.days.length - 1, // the last bar is today
  }));
  const best = weekly.best_day;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <Text style={styles.heading}>Progress</Text>

      {/* A failed refresh keeps the old numbers and shows a small warning */}
      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Could not refresh: {error}</Text>
        </View>
      ) : null}

      {/* Weekly chart */}
      <Card>
        <Text style={styles.cardTitle}>Last 7 days</Text>
        <Text style={styles.cardHint}>Minutes studied each day</Text>
        <View style={styles.chartWrap}>
          <BarChart data={chartData} />
        </View>
        {weekly.total_minutes === 0 ? (
          <Text style={styles.emptyNote}>
            No study time this week yet. Start a session on the Timer tab!
          </Text>
        ) : null}
      </Card>

      {/* Total / Average / Best day */}
      <View style={styles.statsRow}>
        <StatCard icon="time-outline" label="Total" value={formatMinutes(weekly.total_minutes)} />
        <StatCard
          icon="speedometer-outline"
          label="Daily average"
          value={formatMinutes(weekly.average_minutes)}
        />
        <StatCard
          icon="trophy-outline"
          label="Best day"
          value={best.date ? formatMinutes(best.minutes) : '-'}
          sub={best.date ? `${shortWeekday(best.date)} ${formatShortDate(best.date)}` : 'None yet'}
        />
      </View>

      {/* 28-day streak calendar */}
      <Card>
        <Text style={styles.cardTitle}>Streak calendar</Text>
        <Text style={styles.cardHint}>
          Current streak {streak.current_streak} {streak.current_streak === 1 ? 'day' : 'days'}
          {'  |  '}Longest {streak.longest_streak} {streak.longest_streak === 1 ? 'day' : 'days'}
        </Text>
        <View style={styles.calendarWrap}>
          <StreakCalendar days={streak.last_28_days} />
        </View>
      </Card>

      {/* These two screens are built in the next parts of Step 11 */}
      <Button
        title="Study history"
        variant="secondary"
        onPress={() => router.push('/history')}
        style={styles.linkButton}
      />
      <Button title="Badges" variant="secondary" onPress={() => router.push('/badges')} />
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
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { color: colors.danger, fontSize: fontSize.small },
  cardTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  cardHint: { marginTop: spacing.xs, fontSize: fontSize.small, color: colors.muted },
  chartWrap: { marginTop: spacing.lg },
  calendarWrap: { marginTop: spacing.md },
  emptyNote: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.muted,
    textAlign: 'center',
  },
  statsRow: { flexDirection: 'row', marginHorizontal: -spacing.xs },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: { fontSize: 12, color: colors.muted, fontWeight: '600', textAlign: 'center' },
  statSub: { marginTop: 2, fontSize: 11, color: colors.primary, fontWeight: '600' },
  linkButton: { marginBottom: spacing.md },
});