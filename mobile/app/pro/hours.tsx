import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import {
  loadAvailability,
  saveAvailability,
  type ProAvailabilityState,
} from '@/lib/pro-dashboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProHoursScreen() {
  const router = useRouter();
  const [avail, setAvail] = useState<ProAvailabilityState | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAvail(loadAvailability());
  }, []);

  if (!avail) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.sub}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <TextLink label="Back" onPress={() => router.back()} />
      <Text style={styles.title}>Hours</Text>
      <Text style={styles.sub}>Stub — edit your usual windows</Text>

      <Text style={styles.label}>Weekdays</Text>
      <TextInput
        value={avail.weekdayHours}
        onChangeText={(t) => setAvail({ ...avail, weekdayHours: t })}
        style={styles.input}
      />
      <Text style={styles.label}>Weekends</Text>
      <TextInput
        value={avail.weekendHours}
        onChangeText={(t) => setAvail({ ...avail, weekendHours: t })}
        style={styles.input}
      />

      {saved ? <Text style={styles.saved}>Saved</Text> : null}

      <View style={{ marginTop: 32 }}>
        <PrimaryButton
          label="Save"
          onPress={() => {
            saveAvailability(avail);
            setSaved(true);
            setTimeout(() => router.back(), 500);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.screen,
  },
  title: { ...typography.display, color: colors.text, marginTop: 24 },
  sub: { ...typography.small, color: colors.secondary, marginTop: 8 },
  label: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 28,
  },
  input: {
    marginTop: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.input,
    paddingVertical: 12,
    fontSize: 18,
    color: colors.text,
  },
  saved: {
    ...typography.small,
    color: colors.purple,
    marginTop: 16,
    fontWeight: '600',
  },
});
