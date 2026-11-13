// Register screen: name, email, password, confirm password.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../src/components/ScreenContainer';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { useAuth } from '../../src/context/AuthContext';
import { colors, fontSize, radius, spacing } from '../../src/constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    // 1. Check what the user typed
    const newErrors = {};
    const cleanName = name.trim();
    if (cleanName.length < 1) {
      newErrors.name = 'Please enter your name.';
    } else if (cleanName.length > 50) {
      newErrors.name = 'Your name can be at most 50 characters.';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      newErrors.password = 'Your password needs at least 6 characters.';
    }
    if (confirm !== password) {
      newErrors.confirm = 'The two passwords do not match.';
    }
    setErrors(newErrors);
    setFormError('');
    if (Object.keys(newErrors).length > 0) return;

    // 2. Create the account. On success we are logged in and the
    //    route guard sends us to Home by itself.
    setLoading(true);
    const { error } = await signUp(cleanName, email, password);
    if (error) setFormError(error);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenContainer>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="flame" size={44} color={colors.accent} />
          </View>
          <Text style={styles.appName}>TaskGo</Text>
          <Text style={styles.tagline}>Study Streak & Focus Tracker</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>

        {formError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}

        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="What should we call you?"
          autoCapitalize="words"
          error={errors.name}
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          error={errors.email}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />
        <Input
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Type the password again"
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirm}
        />

        <Button
          title="Create account"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>
            Log in
          </Link>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    marginTop: spacing.md,
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: colors.text,
  },
  tagline: { marginTop: spacing.xs, fontSize: fontSize.body, color: colors.muted },
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  errorBox: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: fontSize.body },
  button: { marginTop: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { color: colors.muted, fontSize: fontSize.body },
  link: { color: colors.primary, fontSize: fontSize.body, fontWeight: '700' },
});