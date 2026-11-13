// The "Badge unlocked!" window. Pass the newly earned badges from the backend
// (newly_earned_badges). It shows itself when the list is not empty and
// calls onClose when the user taps the button.
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors, fontSize, radius, spacing } from '../constants/theme';

export default function BadgePopup({ badges = [], onClose }) {
  const visible = badges.length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.heading}>
            {badges.length === 1 ? 'Badge unlocked!' : 'Badges unlocked!'}
          </Text>

          <ScrollView style={styles.list}>
            {badges.map((badge) => (
              <View key={badge.code} style={styles.badge}>
                <View style={styles.iconCircle}>
                  <Ionicons name={badge.icon} size={40} color={colors.accent} />
                </View>
                <Text style={styles.name}>{badge.name}</Text>
                <Text style={styles.description}>{badge.description}</Text>
              </View>
            ))}
          </ScrollView>

          <Button title="Awesome!" onPress={onClose} />
        </View>
      </View>
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
  heading: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  list: { maxHeight: 320, marginBottom: spacing.lg },
  badge: { alignItems: 'center', marginBottom: spacing.lg },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: spacing.md,
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.muted,
    textAlign: 'center',
  },
});