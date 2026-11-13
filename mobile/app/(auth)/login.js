// Login screen: email + password.
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../src/components/ScreenContainer';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import { useAuth } from '../../src/context/AuthContext';
import { colors, fontSize, radius, spacing } from '../../src/constants/theme';

// A simple check: something@something.something
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({}); // messages under each input
  const [formError, setFormError] = useState(''); // message from the server
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    // 1. Check what the user typed
    const newErrors = {};
    if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (password.length === 0) {
      newErrors.password = 'Please enter your password.';
    }
    setErrors(newErrors);
    setFormError('');
    if (Object.keys(newErrors).length > 0) return;

    // 2. Try to log in. On success the route guard sends us to Home by itself.
    setLoading(true);
    const { error } = await signIn(email, password);
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

        <Text style={styles.title}>Welcome back</Text>

        {formError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}

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
          placeholder="Your password"
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />

        <Button
          title="Log in"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to TaskGo? </Text>
          <Link href="/(auth)/register" style={styles.link}>
            Create an account
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