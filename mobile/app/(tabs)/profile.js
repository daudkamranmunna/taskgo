// Profile screen: your name, daily goal (editable), app info and logout.
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import EmptyState from '../../src/components/EmptyState';
import LoadingView from '../../src/components/LoadingView';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/lib/api';
import { formatMinutes } from '../../src/utils/format';
import { APP_NAME, APP_VERSION } from '../../src/constants/config';
import { colors, fontSize, radius, spacing } from '../../src/constants/theme';

const MIN_GOAL = 5;
const MAX_GOAL = 720;

// Moves the goal up or down: steps of 5 minutes up to 60, then steps of 15
function stepGoal(value, direction) {
  const step = value < 60 || (value === 60 && direction < 0) ? 5 : 15;
  return Math.min(MAX_GOAL, Math.max(MIN_GOAL, value + direction * step));
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [goal, setGoal] = useState(60); // the goal being edited (not saved yet)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { text, ok }

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api.getProfile();
      setProfile(data);
      setGoal(data.daily_goal_minutes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load (again) every time this tab comes into view
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

  async function saveGoal() {
    setSaving(true);
    setSaveResult(null);
    try {
      const updated = await api.updateProfile({ daily_goal_minutes: goal });
      setProfile(updated);
      setGoal(updated.daily_goal_minutes);
      setSaveResult({ text: 'Daily goal saved!', ok: true });
    } catch (err) {
      setSaveResult({ text: err.message, ok: false });
    } finally {
      setSaving(false);
    }
  }

  // Ask first, so nobody logs out by accident
  function confirmLogout() {
    Alert.alert('Log out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  // First time: nothing to show yet
  if (loading && !profile) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingView message="Loading your profile... (the free server can take up to a minute to wake up)" />
      </ScreenContainer>
    );
  }

  // Could not load and we have nothing to show
  if (error && !profile) {
    return (
      <ScreenContainer>
        <Text style={styles.heading}>Profile</Text>
        <Card>
          <EmptyState
            icon="cloud-offline-outline"
            title="Could not load your profile"
            message={error}
            actionLabel="Try again"
            onAction={retry}
          />
        </Card>
        <Button title="Log out" variant="danger" onPress={confirmLogout} />
      </ScreenContainer>
    );
  }

  const initial = (profile.display_name || user?.email || '?').charAt(0).toUpperCase();
  const goalChanged = goal !== profile.daily_goal_minutes;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <Text style={styles.heading}>Profile</Text>

      {/* Who you are */}
      <Card style={styles.whoCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{profile.display_name || 'Student'}</Text>
        <Text style={styles.email}>{user ? user.email : ''}</Text>
      </Card>

      {/* Daily goal */}
      <Card>
        <Text style={styles.cardTitle}>Daily study goal</Text>
        <Text style={styles.cardHint}>
          How long do you want to study each day? Your progress ring on Home uses this.
        </Text>

        <View style={styles.stepper}>
          <Pressable
            onPress={() => setGoal(stepGoal(goal, -1))}
            disabled={goal <= MIN_GOAL}
            style={[styles.stepButton, goal <= MIN_GOAL && styles.stepButtonOff]}
            accessibilityLabel="Decrease goal"
          >
            <Ionicons name="remove" size={28} color={colors.primary} />
          </Pressable>

          <Text style={styles.goalValue}>{formatMinutes(goal)}</Text>

          <Pressable
            onPress={() => setGoal(stepGoal(goal, 1))}
            disabled={goal >= MAX_GOAL}
            style={[styles.stepButton, goal >= MAX_GOAL && styles.stepButtonOff]}
            accessibilityLabel="Increase goal"
          >
            <Ionicons name="add" size={28} color={colors.primary} />
          </Pressable>
        </View>

        {saveResult ? (
          <Text style={[styles.saveResult, { color: saveResult.ok ? colors.success : colors.danger }]}>
            {saveResult.text}
          </Text>
        ) : null}

        <Button
          title="Save goal"
          onPress={saveGoal}
          loading={saving}
          disabled={!goalChanged}
        />
      </Card>

      {/* About */}
      <Card>
        <Text style={styles.cardTitle}>About {APP_NAME}</Text>
        <Text style={styles.cardHint}>
          {APP_NAME} helps students build a study habit. It rewards consistency
          with streaks, not just total hours, and links your studying to your
          tasks and deadlines. It is a college semester project.
        </Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </Card>

      <Button title="Log out" variant="danger" onPress={confirmLogout} />
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
  whoCard: { alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 32, fontWeight: '800' },
  name: {
    marginTop: spacing.md,
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  email: { marginTop: spacing.xs, fontSize: fontSize.body, color: colors.muted },
  cardTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  cardHint: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.muted,
    lineHeight: 22,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  stepButton: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonOff: { opacity: 0.4 },
  goalValue: {
    fontSize: fontSize.display,
    fontWeight: '800',
    color: colors.primary,
  },
  saveResult: {
    textAlign: 'center',
    fontSize: fontSize.body,
    marginBottom: spacing.md,
  },
  version: {
    marginTop: spacing.md,
    fontSize: fontSize.small,
    color: colors.muted,
  },
});