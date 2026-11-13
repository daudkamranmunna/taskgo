// A friendly message for when there is nothing to show (or something went wrong).
// icon is the name of an Ionicons icon. Add actionLabel + onAction for a button.
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors, fontSize, spacing } from '../constants/theme';

export default function EmptyState({
  icon = 'file-tray-outline',
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.muted} />
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    color: colors.muted,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
});