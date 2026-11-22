import { useMarket } from '@/components/market/MarketProvider';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import {
  loadProDraft,
  parseStep,
  saveProDraft,
  SPECIALTY_OPTIONS,
  TOTAL_STEPS,
  type OnboardingStep,
  type ProOnboardingDraft,
  type ProSpecialty,
} from '@/lib/pro-onboarding';
import { MOCK_SERVICES } from '@/lib/services';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ProOnboardingScreen() {
  const { market } = useMarket();
  const router = useRouter();
  const { step: stepParam } = useLocalSearchParams<{ step?: string }>();
  const step = parseStep(stepParam);
  const [draft, setDraft] = useState<ProOnboardingDraft>(() => loadProDraft());
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  function go(next: OnboardingStep) {
    router.replace(`/pro/onboarding?step=${next}`);
  }

  function update(partial: Partial<ProOnboardingDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      saveProDraft(next);
      return next;
    });
  }

  const specialtyServices = useMemo(() => {
    if (draft.specialties.length === 0) return MOCK_SERVICES.slice(0, 6);
    return MOCK_SERVICES.filter((s) =>
      draft.specialties.includes(s.category as ProSpecialty)
    );
  }, [draft.specialties]);

  const stepIndex =
    step === 'verify'
      ? 1
      : step === 'profile'
        ? 2
        : step === 'services'
          ? 3
          : step === 'availability'
            ? 4
            : 4;

  function back() {
    if (step === 'verify') router.push('/pro/join');
    else if (step === 'profile') go('verify');
    else if (step === 'services') go('profile');
    else if (step === 'availability') go('services');
    else if (step === 'done') go('availability');
  }

  if (step === 'done') {
    return (
      <View style={styles.wrap}>
        <View style={styles.done}>
          <View style={styles.check}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.title}>{"You're in"}</Text>
          <Text style={styles.sub}>
            {draft.displayName || 'Pro'} · {draft.offerings.length} services ·{' '}
            {draft.radiusKm} km
          </Text>
          <View style={{ marginTop: 40, width: '100%' }}>
            <PrimaryButton
              label="Open dashboard"
              onPress={() => router.replace('/pro/dashboard')}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <TextLink label="Back" onPress={back} />
        <Text style={styles.stepLabel}>
          Step {stepIndex} of {TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 'verify' && (
          <>
            <Text style={styles.title}>Verify</Text>
            <Text style={styles.sub}>Phone number</Text>
            <TextInput
              value={draft.phone}
              onChangeText={(t) => {
                setOtpSent(false);
                update({ phone: t, verified: false });
              }}
              placeholder="+44 7700 900000"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              style={styles.input}
            />
            {otpSent ? (
              <View style={{ marginTop: 28 }}>
                <Text style={styles.sub}>Enter code</Text>
                <TextInput
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                />
                <Text style={styles.hint}>Stub OTP — any 6 digits</Text>
                <View style={{ marginTop: 12 }}>
                  <TextLink
                    label="Resend"
                    onPress={() => {
                      setOtp('');
                      setOtpSent(false);
                    }}
                  />
                </View>
              </View>
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}

        {step === 'profile' && (
          <>
            <Text style={styles.title}>Profile</Text>
            <Pressable
              onPress={() => update({ photoSet: true })}
              style={styles.photo}
            >
              <Text style={styles.photoText}>
                {draft.photoSet ? 'Photo ✓' : 'Add photo'}
              </Text>
            </Pressable>
            <TextInput
              value={draft.displayName}
              onChangeText={(t) => update({ displayName: t })}
              placeholder="Display name"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <Text style={[styles.sub, { marginTop: 32 }]}>Specialties</Text>
            {SPECIALTY_OPTIONS.map((opt) => {
              const on = draft.specialties.includes(opt.id);
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    const specialties = on
                      ? draft.specialties.filter((s) => s !== opt.id)
                      : [...draft.specialties, opt.id];
                    update({ specialties });
                  }}
                  style={styles.pickRow}
                >
                  <Text style={[styles.pickLabel, on && styles.pickOn]}>
                    {opt.label}
                    {on ? ' ·' : ''}
                  </Text>
                </Pressable>
              );
            })}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}

        {step === 'services' && (
          <>
            <Text style={styles.title}>Services</Text>
            <Text style={styles.sub}>Pick and set prices</Text>
            {specialtyServices.map((service) => {
              const on = draft.offerings.some((o) => o.serviceId === service.id);
              const offering = draft.offerings.find(
                (o) => o.serviceId === service.id
              );
              return (
                <View key={service.id} style={styles.serviceBlock}>
                  <Pressable
                    onPress={() => {
                      if (on) {
                        update({
                          offerings: draft.offerings.filter(
                            (o) => o.serviceId !== service.id
                          ),
                        });
                      } else {
                        update({
                          offerings: [
                            ...draft.offerings,
                            {
                              serviceId: service.id,
                              price: service.base_price,
                              durationMins: service.duration_mins,
                            },
                          ],
                        });
                      }
                    }}
                  >
                    <Text style={[styles.pickLabel, on && styles.pickOn]}>
                      {service.name}
                      {on ? ' ·' : ''}
                    </Text>
                  </Pressable>
                  {on ? (
                    <View style={styles.priceRow}>
                      <Text style={styles.sub}>{market.symbol}</Text>
                      <TextInput
                        value={String(offering?.price ?? service.base_price)}
                        onChangeText={(t) => {
                          const price = Number(t) || 0;
                          update({
                            offerings: draft.offerings.map((o) =>
                              o.serviceId === service.id ? { ...o, price } : o
                            ),
                          });
                        }}
                        keyboardType="decimal-pad"
                        style={[styles.input, { flex: 1, marginTop: 0 }]}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}

        {step === 'availability' && (
          <>
            <Text style={styles.title}>Area</Text>
            <Text style={styles.sub}>How far you travel</Text>
            <Text style={styles.radius}>
              {draft.radiusKm}
              <Text style={styles.radiusUnit}> km</Text>
            </Text>
            <View style={styles.radiusBtns}>
              {[5, 10, 15, 20, 25].map((km) => (
                <Pressable
                  key={km}
                  onPress={() => update({ radiusKm: km })}
                  style={[
                    styles.kmChip,
                    draft.radiusKm === km && styles.kmChipOn,
                  ]}
                >
                  <Text
                    style={[
                      styles.kmText,
                      draft.radiusKm === km && styles.kmTextOn,
                    ]}
                  >
                    {km}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.sub, { marginTop: 32 }]}>When you work</Text>
            <Pressable
              onPress={() =>
                update({ availableWeekdays: !draft.availableWeekdays })
              }
              style={styles.pickRow}
            >
              <Text
                style={[
                  styles.pickLabel,
                  draft.availableWeekdays && styles.pickOn,
                ]}
              >
                Weekdays{draft.availableWeekdays ? ' ·' : ''}
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                update({ availableWeekends: !draft.availableWeekends })
              }
              style={styles.pickRow}
            >
              <Text
                style={[
                  styles.pickLabel,
                  draft.availableWeekends && styles.pickOn,
                ]}
              >
                Weekends{draft.availableWeekends ? ' ·' : ''}
              </Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={
            step === 'verify'
              ? otpSent
                ? 'Continue'
                : 'Send code'
              : step === 'availability'
                ? 'Finish'
                : 'Continue'
          }
          onPress={() => {
            setError(null);
            if (step === 'verify') {
              if (!otpSent) {
                if (draft.phone.replace(/\D/g, '').length < 10) {
                  setError('Enter a valid phone');
                  return;
                }
                setOtpSent(true);
                setOtp('123456');
                return;
              }
              if (otp.length < 6) {
                setError('Enter the 6-digit code');
                return;
              }
              update({ verified: true });
              go('profile');
              return;
            }
            if (step === 'profile') {
              if (!draft.displayName.trim()) {
                setError('Name required');
                return;
              }
              if (draft.specialties.length === 0) {
                setError('Pick at least one specialty');
                return;
              }
              go('services');
              return;
            }
            if (step === 'services') {
              if (draft.offerings.length === 0) {
                setError('Pick at least one service');
                return;
              }
              go('availability');
              return;
            }
            if (step === 'availability') {
              if (!draft.availableWeekdays && !draft.availableWeekends) {
                setError('Pick weekdays or weekends');
                return;
              }
              update({ completedAt: new Date().toISOString() });
              go('done');
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.card },
  top: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: { ...typography.caption, color: colors.secondary },
  content: { padding: spacing.screen, paddingBottom: 120 },
  title: { ...typography.display, color: colors.text, marginTop: 24 },
  sub: { ...typography.small, color: colors.secondary, marginTop: 8 },
  input: {
    marginTop: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.input,
    paddingVertical: 12,
    fontSize: 18,
    color: colors.text,
  },
  hint: { ...typography.caption, color: colors.muted, marginTop: 8 },
  error: { ...typography.small, color: '#DC2626', marginTop: 12 },
  photo: {
    marginTop: 28,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    ...typography.small,
    color: colors.purple,
    fontWeight: '600',
  },
  pickRow: { paddingVertical: 14 },
  pickLabel: { fontSize: 20, fontWeight: '600', color: colors.text },
  pickOn: { color: colors.purple },
  serviceBlock: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  radius: { fontSize: 40, fontWeight: '700', color: colors.text, marginTop: 28 },
  radiusUnit: { fontSize: 18, fontWeight: '500', color: colors.secondary },
  radiusBtns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  kmChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.button,
    backgroundColor: colors.bg,
  },
  kmChipOn: { backgroundColor: colors.purple },
  kmText: { ...typography.bodyBold, color: colors.text },
  kmTextOn: { color: colors.white },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.screen,
    backgroundColor: colors.card,
  },
  done: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
  },
  check: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { fontSize: 36, color: colors.white, fontWeight: '700' },
});
