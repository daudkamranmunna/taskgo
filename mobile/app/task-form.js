// The task form: add a new task, or edit an existing one.
// Add:  router.push('/task-form')
// Edit: router.push(taskFormHref(task))  -> the task's fields arrive as route params
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenContainer from '../src/components/ScreenContainer';
import Button from '../src/components/Button';
import Input from '../src/components/Input';
import { api } from '../src/lib/api';
import { todayString } from '../src/utils/date';
import { colors, fontSize, radius, spacing } from '../src/constants/theme';

const SUBJECTS = ['General', 'Math', 'Physics', 'Chemistry', 'Programming', 'Other'];
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'exam', label: 'Exam' },
];
const MAX_TITLE = 120;
const MAX_SUBJECT = 50;
const MAX_NOTE = 1000;

// "2026-11-12" -> a Date at local midnight
function toDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// "2026-11-12" -> "Thu, Nov 12, 2026"
function prettyDate(dateString) {
  return toDate(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TaskForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEdit = Boolean(params.id);

  // ----- starting values (empty for a new task, the task's values for edit) -----
  const startSubject = params.subject || 'General';
  const startChoice =
    SUBJECTS.includes(startSubject) && startSubject !== 'Other' ? startSubject : 'Other';

  const [title, setTitle] = useState(params.title || '');
  const [subjectChoice, setSubjectChoice] = useState(startChoice);
  const [customSubject, setCustomSubject] = useState(startChoice === 'Other' ? startSubject : '');
  const [priority, setPriority] = useState(params.priority || 'medium');
  const [dueDate, setDueDate] = useState(params.due_date || null); // "YYYY-MM-DD" or null
  const [note, setNote] = useState(params.note || '');
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function onPickDate(event, selected) {
    // On Android the picker is a pop-up: close it either way
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (event.type === 'dismissed' || !selected) return;
    setDueDate(todayString(selected)); // reuse the date helper: Date -> "YYYY-MM-DD"
    if (Platform.OS === 'ios') setShowPicker(false);
  }

  async function handleSave() {
    // 1. Check what the user typed
    const newErrors = {};
    const cleanTitle = title.trim();
    if (cleanTitle.length < 1) {
      newErrors.title = 'Please give your task a title.';
    } else if (cleanTitle.length > MAX_TITLE) {
      newErrors.title = `The title can be at most ${MAX_TITLE} characters.`;
    }

    let subject = subjectChoice;
    if (subjectChoice === 'Other') {
      subject = customSubject.trim();
      if (subject.length < 1) {
        newErrors.subject = 'Please type a subject name.';
      } else if (subject.length > MAX_SUBJECT) {
        newErrors.subject = `The subject can be at most ${MAX_SUBJECT} characters.`;
      }
    }

    if (note.length > MAX_NOTE) {
      newErrors.note = `The note can be at most ${MAX_NOTE} characters.`;
    }

    setErrors(newErrors);
    setFormError('');
    if (Object.keys(newErrors).length > 0) return;

    // 2. Save it
    const task = {
      title: cleanTitle,
      subject,
      priority,
      due_date: dueDate, // null means "no due date"
      note: note.trim(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.updateTask(params.id, task);
      } else {
        await api.createTask(task);
      }
      router.back(); // the lists reload by themselves when they come back into view
    } catch (err) {
      setFormError(err.message);
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenContainer edges={['top', 'bottom']}>
        {/* Header with a close button */}
        <View style={styles.header}>
          <Text style={styles.heading}>{isEdit ? 'Edit task' : 'New task'}</Text>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={28} color={colors.muted} />
          </Pressable>
        </View>

        {formError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}

        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Finish physics assignment"
          error={errors.title}
          maxLength={MAX_TITLE + 20}
        />

        {/* Subject */}
        <Text style={styles.label}>Subject</Text>
        <View style={styles.chips}>
          {SUBJECTS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setSubjectChoice(item)}
              style={[styles.chip, subjectChoice === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, subjectChoice === item && styles.chipTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        {subjectChoice === 'Other' ? (
          <Input
            value={customSubject}
            onChangeText={setCustomSubject}
            placeholder="Type the subject name"
            error={errors.subject}
          />
        ) : null}

        {/* Priority */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((item) => {
            const selected = priority === item.value;
            const color = colors.priority[item.value];
            return (
              <Pressable
                key={item.value}
                onPress={() => setPriority(item.value)}
                style={[
                  styles.priorityButton,
                  { borderColor: color },
                  selected && { backgroundColor: color },
                ]}
              >
                <Text style={[styles.priorityText, { color: selected ? colors.white : color }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Due date (optional) */}
        <Text style={styles.label}>Due date (optional)</Text>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <Text style={styles.dateText}>
              {dueDate ? prettyDate(dueDate) : 'No due date. Tap to pick one'}
            </Text>
          </Pressable>
          {dueDate ? (
            <Pressable onPress={() => setDueDate(null)} hitSlop={10} accessibilityLabel="Remove due date">
              <Ionicons name="close-circle" size={26} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        {showPicker ? (
          <DateTimePicker
            value={dueDate ? toDate(dueDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onPickDate}
          />
        ) : null}

        {/* Note (optional) */}
        <Input
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Chapters, page numbers, anything to remember"
          multiline
          style={styles.noteInput}
          error={errors.note}
        />

        <Button
          title={isEdit ? 'Save changes' : 'Add task'}
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} disabled={saving} />
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heading: { fontSize: fontSize.heading, fontWeight: '800', color: colors.text },
  errorBox: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: fontSize.body },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
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
  priorityRow: { flexDirection: 'row', marginBottom: spacing.lg },
  priorityButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginRight: spacing.sm,
  },
  priorityText: { fontSize: fontSize.body - 1, fontWeight: '700' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    marginRight: spacing.sm,
  },
  dateText: { marginLeft: spacing.sm, fontSize: fontSize.body, color: colors.text },
  noteInput: { marginTop: spacing.sm },
  saveButton: { marginTop: spacing.sm, marginBottom: spacing.sm },
});