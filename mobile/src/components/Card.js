// A white rounded box with a soft shadow. Most content lives inside cards.
import { StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../constants/theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow,
  },
});