import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenCard } from '@/components/ui/ScreenCard';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import {
  clearAuthSession,
  fetchAuthConfig,
  loadAuthSession,
  type AuthConfig,
  type AuthSession,
} from '@/lib/auth';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [config, setConfig] = useState<AuthConfig | null>(null);

  const refresh = useCallback(() => {
    setSession(loadAuthSession());
    void fetchAuthConfig().then(setConfig);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <View style={styles.wrap}>
      <ScreenCard>
        <Text style={styles.caption}>
          Auth · {config?.mode === 'live' ? 'Supabase' : config?.mode === 'mock' ? 'Mock' : '…'}
        </Text>
        <Text style={styles.title}>Profile</Text>

        {session ? (
          <>
            <Text style={styles.body}>Signed in</Text>
            <Text style={styles.phone}>{session.phone}</Text>
            <Text style={styles.meta}>
              {session.mode} · {session.userId}
            </Text>
            <View style={styles.btn}>
              <PrimaryButton
                label="Log out"
                onPress={() => {
                  clearAuthSession();
                  setSession(null);
                }}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.body}>
              Sign in with your mobile number. Same OTP APIs as web.
            </Text>
            <View style={styles.btn}>
              <PrimaryButton
                label="Log in"
                onPress={() => router.push('/login')}
              />
            </View>
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <TextLink
                label="Create account"
                onPress={() => router.push('/signup')}
              />
            </View>
          </>
        )}

        <View style={styles.proBlock}>
          <Text style={styles.meta}>Pros</Text>
          <View style={{ marginTop: 8 }}>
            <TextLink
              label="Become a pro"
              onPress={() => router.push('/pro/join')}
            />
          </View>
          <View style={{ marginTop: 12 }}>
            <TextLink
              label="Pro dashboard"
              onPress={() => router.push('/pro/dashboard')}
            />
          </View>
        </View>
      </ScreenCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.screen,
  },
  caption: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { ...typography.display, color: colors.text, marginTop: 8 },
  body: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 8,
  },
  phone: {
    ...typography.heading,
    color: colors.text,
    marginTop: 16,
  },
  meta: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 4,
  },
  btn: { marginTop: spacing.section },
  proBlock: {
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
