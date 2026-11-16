// Timer screen: stopwatch or countdown (25 / 45 / 60 / custom minutes).
// Time is ALWAYS calculated from real timestamps (Date.now()), never by
// counting ticks, so it stays accurate when the app is in the background.
// All ringing logic is in src/utils/alarm.js. This screen only calls it.
// When a session ends it is saved through the API (src/lib/api.js).
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import ScreenContainer from '../../src/components/ScreenContainer';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import ProgressRing from '../../src/components/ProgressRing';
import CustomTimerModal from '../../src/components/CustomTimerModal';
import BadgePopup from '../../src/components/BadgePopup';
import {
  hasAlarmPermission,
  requestAlarmPermission,
  scheduleTimerEnd,
  cancelTimerEnd,
  vibrateAlarm,
} from '../../src/utils/alarm';
import { api } from '../../src/lib/api';
import { formatClock, formatMinutes } from '../../src/utils/format';
import { todayString } from '../../src/utils/date';
import { colors, fontSize, radius, spacing } from '../../src/constants/theme';

const KEEP_AWAKE_TAG = 'taskgo-timer';
const MIN_SAVE_SECONDS = 60; // sessions shorter than this are not saved
const MAX_SUBJECT = 50;
const MAX_NOTE = 1000;

const MODES = [
  { key: 'stopwatch', label: 'Stopwatch' },
  { key: '25', label: '25 min' },
  { key: '45', label: '45 min' },
  { key: '60', label: '60 min' },
  { key: 'custom', label: 'Custom' },
];
const SUBJECTS = ['General', 'Math', 'Physics', 'Chemistry', 'Programming', 'Other'];

export default function Timer() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // A task can be passed in by the Start button on the Tasks screen
  const paramTask = params.taskId
    ? {
        id: String(params.taskId),
        title: String(params.taskTitle || ''),
        subject: String(params.subject || 'General'),
      }
    : null;

  // ----- what the user chose before starting -----
  const [modeKey, setModeKey] = useState('stopwatch'); // 'stopwatch' | '25' | '45' | '60' | 'custom'
  const [customMinutes, setCustomMinutes] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectChoice, setSubjectChoice] = useState('General');
  const [customSubject, setCustomSubject] = useState('');
  const [subjectError, setSubjectError] = useState('');

  // ----- the running session -----
  const [phase, setPhase] = useState('idle'); // 'idle' | 'running' | 'paused' | 'finished'
  const [accumulatedMs, setAccumulatedMs] = useState(0); // time studied before the current run
  const [segmentStart, setSegmentStart] = useState(null); // when the current run began
  const [now, setNow] = useState(Date.now()); // refreshed 4 times a second while running
  const [session, setSession] = useState(null); // { startedAt, subject, task, totalSeconds }
  const [result, setResult] = useState(null); // filled when the session ends
  const [starting, setStarting] = useState(false);

  // ----- after the session: saving, note, task, badges -----
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [saveError, setSaveError] = useState('');
  const [savedSession, setSavedSession] = useState(null); // the row the backend returned
  const [note, setNote] = useState('');
  const [noteState, setNoteState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [noteError, setNoteError] = useState('');
  const [taskState, setTaskState] = useState('ask'); // 'ask' | 'saving' | 'done' | 'skipped' | 'error'
  const [taskError, setTaskError] = useState('');
  const [popupBadges, setPopupBadges] = useState([]); // badges to celebrate

  const alarmIdRef = useRef(null); // the scheduled ring, so we can cancel it
  const askedPermissionRef = useRef(false); // ask for permission only once
  const completedRef = useRef(false); // makes sure a session ends only once
  const savingRef = useRef(false); // makes sure a session is saved only once at a time

  // ----- numbers worked out from the state -----
  const plannedMinutes = modeKey === 'custom' ? customMinutes : modeKey === 'stopwatch' ? null : Number(modeKey);
  const totalSeconds = session
    ? session.totalSeconds
    : plannedMinutes
      ? plannedMinutes * 60
      : null; // null = stopwatch (or custom not chosen yet)
  const isCountdown = session ? session.totalSeconds !== null : modeKey !== 'stopwatch';
  const elapsedMs = Math.max(
    0,
    accumulatedMs + (phase === 'running' && segmentStart !== null ? now - segmentStart : 0)
  );

  let displaySeconds = 0;
  if (phase === 'idle') {
    displaySeconds = totalSeconds !== null ? totalSeconds : 0;
  } else if (phase === 'finished') {
    displaySeconds = 0;
  } else if (totalSeconds !== null) {
    displaySeconds = Math.ceil(Math.max(0, totalSeconds * 1000 - elapsedMs) / 1000); // remaining
  } else {
    displaySeconds = Math.floor(elapsedMs / 1000); // elapsed
  }

  // The ring fills up as time passes. The stopwatch ring turns once per hour.
  let ringProgress = 0;
  if (phase === 'running' || phase === 'paused') {
    ringProgress =
      totalSeconds !== null
        ? elapsedMs / (totalSeconds * 1000)
        : ((elapsedMs / 1000) % 3600) / 3600;
  }

  // The task shown on screen: the passed-in one while idle, the session's own while it runs
  const shownTask = phase === 'idle' ? paramTask : session ? session.task : null;

  // ----- effects -----

  // While running: refresh `now` 4 times a second
  useEffect(() => {
    if (phase !== 'running') return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [phase]);

  // Coming back from the background: refresh at once
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  // Keep the screen awake only while the timer is running
  useEffect(() => {
    if (phase !== 'running') return undefined;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      Promise.resolve(deactivateKeepAwake(KEEP_AWAKE_TAG)).catch(() => {});
    };
  }, [phase]);

  // A countdown that reaches zero while we are looking: time is up!
  useEffect(() => {
    if (phase !== 'running' || !session || session.totalSeconds === null) return;
    const totalMs = session.totalSeconds * 1000;
    const elapsed = accumulatedMs + (now - segmentStart);
    if (elapsed >= totalMs) {
      // Only vibrate if we see the end happen. If we are coming back long after
      // the alarm already rang, just show the result.
      if (elapsed - totalMs < 3000) vibrateAlarm();
      completeSession(session.totalSeconds, true);
    }
  }, [now, phase]);

  // If the screen goes away (for example on logout), drop the scheduled ring
  useEffect(() => {
    return () => {
      cancelTimerEnd(alarmIdRef.current);
    };
  }, []);

  // ----- actions: starting, pausing, finishing -----

  // Explain why we need permission, then ask. Only once per app launch.
  async function ensureAlarmPermission() {
    if (askedPermissionRef.current) return;
    if (await hasAlarmPermission()) return;
    askedPermissionRef.current = true;
    await new Promise((resolve) => {
      Alert.alert(
        'Let the timer ring?',
        'TaskGo needs permission to send a notification, so your timer can ring when time is up, even if the app is closed or your phone is locked.',
        [
          { text: 'Not now', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Allow',
            onPress: async () => {
              await requestAlarmPermission();
              resolve();
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  function selectMode(key) {
    if (key === 'custom') {
      setModalOpen(true);
    } else {
      setModeKey(key);
    }
  }

  async function handleStart() {
    // 1. Which subject?
    let subject;
    if (paramTask) {
      subject = paramTask.subject;
    } else if (subjectChoice === 'Other') {
      subject = customSubject.trim();
      if (subject.length < 1) {
        setSubjectError('Please type a subject name.');
        return;
      }
      if (subject.length > MAX_SUBJECT) {
        setSubjectError(`The subject can be at most ${MAX_SUBJECT} characters.`);
        return;
      }
    } else {
      subject = subjectChoice;
    }
    setSubjectError('');

    // 2. Custom needs a number of minutes first
    if (modeKey === 'custom' && !customMinutes) {
      setModalOpen(true);
      return;
    }

    setStarting(true);
    const countdown = modeKey !== 'stopwatch';
    if (countdown) await ensureAlarmPermission();

    // 3. Start. The moment is saved as a timestamp.
    const startMs = Date.now();
    const planned = countdown ? plannedMinutes * 60 : null;
    completedRef.current = false;
    setSession({
      startedAt: new Date(startMs).toISOString(),
      subject,
      task: paramTask,
      totalSeconds: planned,
    });
    setResult(null);
    setAccumulatedMs(0);
    setSegmentStart(startMs);
    setNow(startMs);
    setPhase('running');
    setStarting(false);

    // 4. A countdown asks the phone to ring at the exact end time
    if (planned !== null) {
      alarmIdRef.current = await scheduleTimerEnd(startMs + planned * 1000, subject);
    }
  }

  async function handlePause() {
    const t = Date.now();
    setAccumulatedMs(accumulatedMs + (t - segmentStart));
    setSegmentStart(null);
    setPhase('paused');
    await cancelTimerEnd(alarmIdRef.current); // pausing cancels the ring
    alarmIdRef.current = null;
  }

  async function handleResume() {
    const t = Date.now();
    setSegmentStart(t);
    setNow(t);
    setPhase('running');
    // Resuming schedules a new ring for the time that is left
    if (session.totalSeconds !== null) {
      const remainingMs = session.totalSeconds * 1000 - accumulatedMs;
      alarmIdRef.current = await scheduleTimerEnd(t + remainingMs, session.subject);
    }
  }

  function handleFinish() {
    const seconds = Math.floor(
      (accumulatedMs + (phase === 'running' ? Date.now() - segmentStart : 0)) / 1000
    );
    if (seconds < MIN_SAVE_SECONDS) {
      Alert.alert(
        'That was quick!',
        'Sessions shorter than 1 minute are not saved. Keep studying, or discard this one.',
        [
          { text: 'Keep studying', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: resetTimer },
        ]
      );
      return;
    }
    completeSession(seconds, false);
  }

  // Ends the session, shows the result and saves it.
  // timeUp true: the countdown ran out. false: the user pressed Finish.
  async function completeSession(durationSeconds, timeUp) {
    if (completedRef.current) return;
    completedRef.current = true;
    setSegmentStart(null);
    setPhase('finished');

    const data = {
      durationSeconds,
      timeUp,
      startedAt: session.startedAt,
      subject: session.subject,
      task: session.task,
      sessionDate: todayString(new Date(session.startedAt)), // the local date it started
    };
    setResult(data);
    saveSession(data); // save right away

    if (!timeUp) {
      await cancelTimerEnd(alarmIdRef.current); // finishing early cancels the ring
    }
    alarmIdRef.current = null;
  }

  // ----- actions: saving and what comes after -----

  // Sends the session to the backend. Safe to call again after an error.
  // withoutTask: save it even though the linked task no longer exists.
  async function saveSession(data, withoutTask = false) {
    if (savingRef.current) return; // already saving
    savingRef.current = true;
    setSaveState('saving');
    setSaveError('');
    try {
      const response = await api.createSession({
        subject: data.subject,
        duration_seconds: data.durationSeconds,
        started_at: data.startedAt,
        session_date: data.sessionDate,
        ...(data.task && !withoutTask ? { task_id: data.task.id } : {}),
      });
      setSavedSession(response.session);
      setSaveState('saved');
      if (response.newly_earned_badges.length > 0) {
        setPopupBadges(response.newly_earned_badges);
      }
    } catch (err) {
      setSaveError(err.message);
      setSaveState('error');
    } finally {
      savingRef.current = false;
    }
  }

  async function saveNote() {
    const text = note.trim();
    if (!text || !savedSession) return;
    setNoteState('saving');
    setNoteError('');
    try {
      const updated = await api.updateSessionNote(savedSession.id, text);
      setSavedSession(updated);
      setNoteState('saved');
    } catch (err) {
      setNoteError(err.message);
      setNoteState('error');
    }
  }

  async function markTaskDone() {
    setTaskState('saving');
    setTaskError('');
    try {
      const response = await api.updateTask(result.task.id, { is_done: true });
      setTaskState('done');
      if (response.newly_earned_badges.length > 0) {
        setPopupBadges(response.newly_earned_badges);
      }
    } catch (err) {
      setTaskError(err.message);
      setTaskState('error');
    }
  }

  function confirmDiscard() {
    Alert.alert(
      'Discard this session?',
      'It has not been saved, and it cannot be recovered.',
      [
        { text: 'Keep it', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: handleDone },
      ]
    );
  }

  function resetTimer() {
    cancelTimerEnd(alarmIdRef.current);
    alarmIdRef.current = null;
    completedRef.current = false;
    savingRef.current = false;
    setPhase('idle');
    setSession(null);
    setResult(null);
    setAccumulatedMs(0);
    setSegmentStart(null);
    setSaveState('idle');
    setSaveError('');
    setSavedSession(null);
    setNote('');
    setNoteState('idle');
    setNoteError('');
    setTaskState('ask');
    setTaskError('');
    setPopupBadges([]);
  }

  // Forget the task that was passed in from the Tasks screen
  function unlinkTask() {
    router.setParams({ taskId: '', taskTitle: '', subject: '' });
  }

  function handleDone() {
    resetTimer();
    unlinkTask();
  }

  // ----- what to show -----
  const modeLabel = isCountdown
    ? `Countdown, ${formatMinutes(Math.round((totalSeconds || 0) / 60))}`
    : 'Stopwatch';
  const statusText =
    phase === 'running' ? 'Stay focused' : phase === 'paused' ? 'Paused' : 'Ready when you are';

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Timer</Text>

      {/* The task this session is for */}
      {shownTask ? (
        <Card style={styles.taskCard}>
          <Ionicons name="checkbox-outline" size={24} color={colors.primary} />
          <View style={styles.taskText}>
            <Text style={styles.taskLabel}>Studying for</Text>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {shownTask.title}
            </Text>
            <Text style={styles.taskSubject}>{shownTask.subject}</Text>
          </View>
          {phase === 'idle' ? (
            <Pressable onPress={unlinkTask} hitSlop={10} accessibilityLabel="Remove the task">
              <Ionicons name="close-circle" size={26} color={colors.muted} />
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {phase === 'finished' && result ? (
        <>
          {/* ----- the result ----- */}
          <Card style={styles.resultCard}>
            <Ionicons
              name={result.timeUp ? 'alarm' : 'checkmark-circle'}
              size={56}
              color={result.timeUp ? colors.accent : colors.success}
            />
            <Text style={styles.resultTitle}>{result.timeUp ? "Time's up!" : 'Session finished'}</Text>
            <Text style={styles.resultText}>
              You studied {formatMinutes(Math.floor(result.durationSeconds / 60))} of {result.subject}.
            </Text>

            {saveState === 'saving' ? (
              <View style={styles.statusRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.statusText}>Saving your session...</Text>
              </View>
            ) : null}

            {saveState === 'saved' ? (
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>Session saved</Text>
              </View>
            ) : null}

            {saveState === 'error' ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorText}>Could not save: {saveError}</Text>
                <Button
                  title="Try again"
                  onPress={() => saveSession(result)}
                  style={styles.fullButton}
                />
                {result.task && /task/i.test(saveError) ? (
                  <Button
                    title="Save without the task"
                    variant="secondary"
                    onPress={() => saveSession(result, true)}
                    style={styles.fullButton}
                  />
                ) : null}
                <Button
                  title="Discard this session"
                  variant="ghost"
                  onPress={confirmDiscard}
                  style={styles.fullButton}
                />
              </View>
            ) : null}
          </Card>

          {/* ----- after it is saved: note, task, done ----- */}
          {saveState === 'saved' ? (
            <>
              <Card>
                <Text style={styles.cardTitle}>Add a note (optional)</Text>
                <Input
                  value={note}
                  onChangeText={(text) => {
                    setNote(text);
                    if (noteState !== 'saving') setNoteState('idle');
                  }}
                  placeholder="What did you study? Anything to remember?"
                  multiline
                  maxLength={MAX_NOTE}
                  style={styles.noteInput}
                />
                {noteState === 'saved' ? (
                  <Text style={[styles.statusText, { color: colors.success, marginBottom: spacing.sm }]}>
                    Note saved
                  </Text>
                ) : null}
                {noteState === 'error' ? (
                  <Text style={[styles.errorText, { marginBottom: spacing.sm }]}>{noteError}</Text>
                ) : null}
                <Button
                  title="Save note"
                  variant="secondary"
                  onPress={saveNote}
                  loading={noteState === 'saving'}
                  disabled={!note.trim() || noteState === 'saved'}
                />
              </Card>

              {result.task && (taskState === 'ask' || taskState === 'saving' || taskState === 'error') ? (
                <Card>
                  <Text style={styles.cardTitle}>Mark this task as done?</Text>
                  <Text style={styles.taskAsk} numberOfLines={2}>
                    {result.task.title}
                  </Text>
                  {taskState === 'error' ? (
                    <Text style={[styles.errorText, { marginBottom: spacing.sm }]}>
                      Could not update the task: {taskError}
                    </Text>
                  ) : null}
                  <View style={styles.buttonRow}>
                    <Button
                      title="Yes, done"
                      onPress={markTaskDone}
                      loading={taskState === 'saving'}
                      style={styles.rowButton}
                    />
                    <Button
                      title="Not yet"
                      variant="secondary"
                      onPress={() => setTaskState('skipped')}
                      disabled={taskState === 'saving'}
                      style={styles.rowButton}
                    />
                  </View>
                </Card>
              ) : null}

              {result.task && taskState === 'done' ? (
                <Card>
                  <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                    <Text style={[styles.statusText, { color: colors.success }]}>
                      Task marked as done
                    </Text>
                  </View>
                </Card>
              ) : null}

              <Button title="Done" onPress={handleDone} />
            </>
          ) : null}
        </>
      ) : (
        <>
          {/* Mode chips: only before starting */}
          {phase === 'idle' ? (
            <View style={styles.chips}>
              {MODES.map((mode) => {
                const selected = modeKey === mode.key;
                const label =
                  mode.key === 'custom' && customMinutes ? `Custom: ${customMinutes} min` : mode.label;
                return (
                  <Pressable
                    key={mode.key}
                    onPress={() => selectMode(mode.key)}
                    style={[styles.chip, selected && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.modeLine}>{modeLabel}</Text>
          )}

          {/* Subject chips: only before starting, and only without a task */}
          {phase === 'idle' && !paramTask ? (
            <View style={styles.subjectBlock}>
              <Text style={styles.label}>Subject</Text>
              <View style={styles.chips}>
                {SUBJECTS.map((item) => {
                  const selected = subjectChoice === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        setSubjectChoice(item);
                        setSubjectError('');
                      }}
                      style={[styles.chip, selected && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{item}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {subjectChoice === 'Other' ? (
                <Input
                  value={customSubject}
                  onChangeText={setCustomSubject}
                  placeholder="Type the subject name"
                  error={subjectError}
                />
              ) : null}
            </View>
          ) : session ? (
            <Text style={styles.subjectLine}>Subject: {session.subject}</Text>
          ) : null}

          {/* The big clock */}
          <View style={styles.clockWrap}>
            <ProgressRing progress={ringProgress} size={260} thickness={16}>
              <Text style={styles.clock}>{formatClock(displaySeconds)}</Text>
              <Text style={styles.status}>{statusText}</Text>
            </ProgressRing>
          </View>

          {/* Buttons */}
          {phase === 'idle' ? (
            <Button title="Start" onPress={handleStart} loading={starting} />
          ) : (
            <View style={styles.buttonRow}>
              <Button
                title={phase === 'running' ? 'Pause' : 'Resume'}
                variant="secondary"
                onPress={phase === 'running' ? handlePause : handleResume}
                style={styles.rowButton}
              />
              <Button title="Finish" variant="danger" onPress={handleFinish} style={styles.rowButton} />
            </View>
          )}
        </>
      )}

      <CustomTimerModal
        visible={modalOpen}
        initialMinutes={customMinutes}
        onConfirm={(minutes) => {
          setCustomMinutes(minutes);
          setModeKey('custom');
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
      />

      <BadgePopup badges={popupBadges} onClose={() => setPopupBadges([])} />
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
  taskCard: { flexDirection: 'row', alignItems: 'center' },
  taskText: { flex: 1, marginHorizontal: spacing.md },
  taskLabel: { fontSize: fontSize.small, color: colors.muted },
  taskTitle: { fontSize: fontSize.body, fontWeight: '700', color: colors.text },
  taskSubject: { fontSize: fontSize.small, color: colors.primary, fontWeight: '600', marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.body - 1, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.white },
  modeLine: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  subjectBlock: { marginTop: spacing.sm },
  subjectLine: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.muted,
    textAlign: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  clockWrap: { alignItems: 'center', marginVertical: spacing.xl },
  clock: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  status: { marginTop: spacing.xs, fontSize: fontSize.body, color: colors.muted },
  buttonRow: { flexDirection: 'row' },
  rowButton: { flex: 1, marginHorizontal: spacing.xs },
  resultCard: { alignItems: 'center', paddingVertical: spacing.xl },
  resultTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
  },
  resultText: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    color: colors.text,
    textAlign: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  statusText: { marginLeft: spacing.sm, fontSize: fontSize.body, fontWeight: '700', color: colors.muted },
  errorWrap: { alignSelf: 'stretch', marginTop: spacing.lg },
  errorText: { color: colors.danger, fontSize: fontSize.body, textAlign: 'center' },
  fullButton: { alignSelf: 'stretch', marginTop: spacing.sm },
  cardTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  noteInput: { marginBottom: spacing.sm },
  taskAsk: { fontSize: fontSize.body, color: colors.muted, marginBottom: spacing.md },
});