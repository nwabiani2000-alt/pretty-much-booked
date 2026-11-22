import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import {
  loadProDraft,
  saveProDraft,
  SPECIALTY_OPTIONS,
  type ProCity,
  type ProOnboardingDraft,
  type ProSpecialty,
} from '@/lib/pro-onboarding';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/** One-screen apply scaffold — mirrors web /pro/join. */
export default function ProJoinScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialties, setSpecialties] = useState<ProSpecialty[]>([]);
  const [city, setCity] = useState<ProCity>('london');
  const [portfolio, setPortfolio] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadProDraft();
    if (d.displayName) setName(d.displayName);
    if (d.phone) setPhone(d.phone);
    if (d.specialties.length) setSpecialties(d.specialties);
    if (d.city) setCity(d.city);
    if (d.portfolioUrls?.length) setPortfolio(d.portfolioUrls.join('\n'));
  }, []);

  function toggleSpecialty(id: ProSpecialty) {
    setSpecialties((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function onApply() {
    setError(null);
    if (!name.trim()) {
      setError('Name required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone required');
      return;
    }
    if (specialties.length === 0) {
      setError('Pick at least one service');
      return;
    }
    const prev = loadProDraft();
    const next: ProOnboardingDraft = {
      ...prev,
      displayName: name.trim(),
      phone: phone.trim(),
      specialties,
      city,
      portfolioUrls: portfolio
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
      verified: prev.verified || Boolean(phone.trim()),
      completedAt: new Date().toISOString(),
    };
    saveProDraft(next);
    router.push('/pro/dashboard');
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <TextLink label="Customer app" onPress={() => router.replace('/')} />

      <Text style={styles.eyebrow}>Pros</Text>
      <Text style={styles.title}>Become a pro</Text>
      <Text style={styles.body}>
        One form. We&apos;ll follow up. Manage jobs from your dashboard.
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+44 or +234"
        placeholderTextColor={colors.muted}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Services</Text>
      <View style={styles.chips}>
        {SPECIALTY_OPTIONS.map((opt) => {
          const on = specialties.includes(opt.id);
          return (
            <Pressable
              key={opt.id}
              onPress={() => toggleSpecialty(opt.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>City</Text>
      <View style={styles.seg}>
        {(
          [
            { id: 'london' as const, label: 'London £' },
            { id: 'lagos' as const, label: 'Lagos ₦' },
          ] as const
        ).map((c) => {
          const on = city === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCity(c.id)}
              style={[styles.segBtn, on && styles.segBtnOn]}
            >
              <Text style={[styles.segText, on && styles.segTextOn]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Portfolio links</Text>
      <TextInput
        value={portfolio}
        onChangeText={setPortfolio}
        placeholder="Instagram, website — one per line"
        placeholderTextColor={colors.muted}
        multiline
        style={[styles.input, styles.area]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.btn}>
        <PrimaryButton label="Apply" onPress={onApply} />
      </View>
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <TextLink
          label="I already joined"
          onPress={() => router.push('/pro/dashboard')}
        />
      </View>
      <View style={{ marginTop: 12, alignItems: 'center' }}>
        <TextLink
          label="Full setup"
          onPress={() => router.push('/pro/onboarding?step=verify')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 48 },
  eyebrow: {
    ...typography.caption,
    color: colors.purple,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 24,
  },
  title: { ...typography.display, color: colors.text, marginTop: 8 },
  body: { ...typography.small, color: colors.secondary, marginTop: 8 },
  label: {
    ...typography.caption,
    color: colors.secondary,
    marginTop: 20,
    marginBottom: 6,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.input,
    paddingVertical: 10,
    ...typography.body,
    color: colors.text,
  },
  area: { minHeight: 72, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.card,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.purple },
  chipText: { ...typography.small, color: colors.secondary, fontWeight: '500' },
  chipTextOn: { color: colors.white },
  seg: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.button,
    padding: 2,
    alignSelf: 'flex-start',
  },
  segBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  segBtnOn: {
    backgroundColor: colors.bg,
    borderRadius: radii.button,
  },
  segText: { ...typography.small, color: colors.secondary, fontWeight: '500' },
  segTextOn: { color: colors.purple },
  error: { ...typography.small, color: '#DC2626', marginTop: 12 },
  btn: { marginTop: 32 },
});
