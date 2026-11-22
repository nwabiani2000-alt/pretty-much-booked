import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenCard } from '@/components/ui/ScreenCard';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import {
  fetchAuthConfig,
  isValidPhone,
  normalizePhone,
  saveAuthSession,
  sendOtp,
  verifyOtp,
  type AuthConfig,
} from '@/lib/auth';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  mode: 'login' | 'signup';
};

export function PhoneOtpForm({ mode }: Props) {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; phone?: string }>();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [normalized, setNormalized] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    void fetchAuthConfig().then(setConfig);
  }, []);

  // Demo deep-link: /login?step=code&phone=+447700900123
  useEffect(() => {
    if (params.step !== 'code') return;
    const p = params.phone || '+447700900123';
    const n = normalizePhone(p);
    setPhone(p);
    setNormalized(n);
    setHint('Use code 000000');
    setStep('code');
  }, [params.step, params.phone]);

  async function sendCode(fromResend = false) {
    setError(null);
    const n = fromResend && normalized ? normalized : normalizePhone(phone);
    if (!isValidPhone(n)) {
      setError('Enter a valid mobile number');
      return;
    }
    setBusy(true);
    try {
      const result = await sendOtp(n);
      if (!result.ok) {
        setError(result.error || 'Could not send code');
        return;
      }
      setNormalized(n);
      setHint(result.hint || null);
      setStep('code');
    } catch {
      setError('Could not send code');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code');
      return;
    }
    setBusy(true);
    try {
      const result = await verifyOtp(normalized, code.trim());
      if (!result.ok || !result.session) {
        setError(result.error || 'Invalid code');
        return;
      }
      saveAuthSession(result.session);
      router.replace('/profile');
    } catch {
      setError('Could not verify code');
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'login' ? 'Log in' : 'Sign up';
  const altHref = mode === 'login' ? '/signup' : '/login';
  const altLabel = mode === 'login' ? 'Create account' : 'Log in instead';
  const authMode = config?.mode ?? '…';

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <ScreenCard>
        <Text style={styles.caption}>
          Auth · {authMode === 'live' ? 'Supabase' : authMode === 'mock' ? 'Mock' : '…'}
        </Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>
          {step === 'phone'
            ? 'We’ll text a one-time code'
            : `Code sent to ${normalized}`}
        </Text>

        {step === 'phone' && (
          <View style={styles.block}>
            <Text style={styles.label}>Mobile number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="07…"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={[styles.input, error ? styles.inputError : null]}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={{ marginTop: 24 }}>
              <PrimaryButton
                label={busy ? '…' : 'Send code'}
                disabled={busy}
                onPress={() => void sendCode()}
              />
            </View>
          </View>
        )}

        {step === 'code' && (
          <View style={styles.block}>
            <Text style={styles.label}>6-digit code</Text>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              style={[
                styles.input,
                error
                  ? styles.inputError
                  : code.length === 6
                    ? styles.inputOk
                    : null,
              ]}
              maxLength={6}
            />
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={{ marginTop: 24 }}>
              <PrimaryButton
                label={
                  busy ? '…' : mode === 'login' ? 'Log in' : 'Create account'
                }
                disabled={busy}
                onPress={() => void verifyCode()}
              />
            </View>
            <View style={styles.linkRow}>
              <TextLink
                label="Change number"
                onPress={() => {
                  setStep('phone');
                  setCode('');
                  setError(null);
                }}
              />
              <TextLink
                label="Resend"
                onPress={() => void sendCode(true)}
              />
            </View>
          </View>
        )}

        <View style={styles.alt}>
          <Link href={altHref} asChild>
            <TextLink label={altLabel} />
          </Link>
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 40 },
  caption: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { ...typography.display, color: colors.text, marginTop: 8 },
  sub: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 8,
  },
  block: { marginTop: 28 },
  label: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    marginTop: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.input,
    paddingVertical: 12,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 1,
  },
  inputError: { borderBottomColor: '#DC2626' },
  inputOk: { borderBottomColor: colors.purple },
  hint: {
    ...typography.caption,
    color: colors.secondary,
    marginTop: 10,
  },
  error: {
    ...typography.small,
    color: '#DC2626',
    marginTop: 10,
  },
  linkRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  alt: { marginTop: 32, alignItems: 'center' },
});
