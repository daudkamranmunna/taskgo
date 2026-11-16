// The pop-up where you type how many minutes a custom countdown lasts.
// Rule: a whole number from 1 to 600. Needs no database or API changes.
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from './Button';
import Input from './Input';
import { colors, fontSize, radius, spacing } from '../constants/theme';

export const MIN_CUSTOM_MINUTES = 1;
export const MAX_CUSTOM_MINUTES = 600;
const QUICK_CHOICES = [15, 30, 50, 90];

// Checks the text the user typed.
// Returns { minutes } when it is fine, or { error } with a friendly message.
export function parseCustomMinutes(text) {
  const trimmed = String(text).trim();
  if (trimmed === '') {
    return { error: 'Please type how many minutes you want.' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { error: 'Please use a whole number, like 30 or 45.' };
  }
  const minutes = Number(trimmed);
  if (minutes < MIN_CUSTOM_MINUTES || minutes > MAX_CUSTOM_MINUTES) {
    return {
      error: `Please choose between ${MIN_CUSTOM_MINUTES} and ${MAX_CUSTOM_MINUTES} minutes.`,
    };
  }
  return { minutes };
}

// visible:        show or hide the pop-up
// initialMinutes: the number to start with (or null)
// onConfirm(m):   called with the chosen minutes (a whole number)
// onCancel():     called when the user closes the pop-up
export default function CustomTimerModal({ visible, initialMinutes, onConfirm, onCancel }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  // Each time the pop-up opens, start fresh
  useEffect(() => {
    if (visible) {
      setText(initialMinutes ? String(initialMinutes) : '');
      setError('');
    }
  }, [visible, initialMinutes]);

  function submit() {
    const result = parseCustomMinutes(text);
    if (result.error) {
      setError(result.error);
      return;
    }
    onConfirm(result.minutes);
  }

  function pick(minutes) {
    setText(String(minutes));
    setError('');
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.box}>
          <Text style={styles.title}>Custom timer</Text>
          <Text style={styles.hint}>
            How many minutes do you want to study? ({MIN_CUSTOM_MINUTES} to {MAX_CUSTOM_MINUTES})
          </Text>

          <Input
            value={text}
            onChangeText={(value) => {
              setText(value);
              setError('');
            }}
            placeholder="For example: 46"
            keyboardType="number-pad"
            maxLength={3}
            autoFocus
            error={error}
            onSubmitEditing={submit}
          />

          <View style={styles.quickRow}>
            {QUICK_CHOICES.map((minutes) => (
              <Pressable key={minutes} onPress={() => pick(minutes)} style={styles.quickChip}>
                <Text style={styles.quickText}>{minutes}</Text>
              </Pressable>
            ))}
          </View>

          <Button title="Set timer" onPress={submit} style={styles.setButton} />
          <Button title="Cancel" variant="ghost" onPress={onCancel} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  box: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    fontSize: fontSize.body,
    color: colors.muted,
  },
  quickRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  quickChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  quickText: { color: colors.primary, fontWeight: '700', fontSize: fontSize.body },
  setButton: { marginBottom: spacing.sm },
});