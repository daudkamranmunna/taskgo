// A large rounded button.
// variant: 'primary' (purple), 'secondary' (outlined), 'danger' (red), 'ghost' (text only)
// loading: shows a spinner and blocks taps while something is happening
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';

const VARIANTS = {
  primary: { background: colors.primary, text: colors.white, border: colors.primary },
  secondary: { background: colors.white, text: colors.primary, border: colors.primary },
  danger: { background: colors.danger, text: colors.white, border: colors.danger },
  ghost: { background: 'transparent', text: colors.muted, border: 'transparent' },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const look = VARIANTS[variant] || VARIANTS.primary;
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: look.background, borderColor: look.border },
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.text} />
      ) : (
        <Text style={[styles.title, { color: look.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '700',
  },
  inactive: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
});