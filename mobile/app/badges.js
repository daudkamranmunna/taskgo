// Badges screen: a grid of all badges. Earned ones are colored, locked ones gray.
// Opened from the Progress and Profile screens.
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../src/components/ScreenContainer';
import Card from '../src/components/Card';
import EmptyState from '../src/components/EmptyState';
import LoadingView from '../src/components/LoadingView';
import BadgeItem from '../src/components/BadgeItem';
import { api } from '../src/lib/api';
import { colors, fontSize, radius, spacing } from '../src/constants/theme';

export default function Badges() {
  const router = useRouter();
  const [badges, setBadges] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setBadges(await api.getBadges());
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

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
        <Ionicons name="chevron-back" size={30} color={colors.text} />
      </Pressable>
      <Text style={styles.heading}>Badges</Text>
    </View>
  );

  let content;
  if (loading && badges === null) {
    content = <LoadingView message="Loading your badges... (the free server can take up to a minute to wake up)" />;
  } else if (error && badges === null) {
    content = (
      <Card>
        <EmptyState
          icon="cloud-offline-outline"
          title="Could not load your badges"
          message={error}
          actionLabel="Try again"
          onAction={retry}
        />
      </Card>
    );
  } else if (badges.length === 0) {
    content = (
      <Card>
        <EmptyState
          icon="ribbon-outline"
          title="No badges found"
          message="Pull down to try again."
        />
      </Card>
    );
  } else {
    const earnedCount = badges.filter((badge) => badge.earned).length;
    content = (
      <>
        <Text style={styles.summary}>
          {earnedCount} of {badges.length} unlocked
        </Text>
        <View style={styles.grid}>
          {badges.map((badge) => (
            <View key={badge.code} style={styles.gridItem}>
              <BadgeItem badge={badge} />
            </View>
          ))}
        </View>
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

      {/* A failed refresh keeps the old badges and shows a small warning */}
      {error && badges !== null ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Could not refresh: {error}</Text>
        </View>
      ) : null}

      {content}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  heading: {
    marginLeft: spacing.sm,
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
  },
  summary: {
    marginBottom: spacing.lg,
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.primary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: spacing.md },
  banner: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { color: colors.danger, fontSize: fontSize.small },
});