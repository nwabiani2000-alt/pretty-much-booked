import { ProCard } from '@/components/booking/ProCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { StepProgress } from '@/components/ui/StepProgress';
import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { fetchProsForService } from '@/lib/catalog-client';
import { type MockProListing } from '@/lib/mock-pros';
import { getServiceById } from '@/lib/services';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const INITIAL_VISIBLE = 3;

export default function ProsForServiceScreen() {
  const router = useRouter();
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const service = getServiceById(serviceId ?? '');
  const [pros, setPros] = useState<MockProListing[]>([]);
  const [mode, setMode] = useState<'live' | 'mock' | null>(null);
  const [source, setSource] = useState<'api' | 'fallback' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [bookMode, setBookMode] = useState<'match' | 'pick'>('pick');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchProsForService(serviceId ?? '').then((result) => {
      if (cancelled) return;
      setPros(result.pros);
      setMode(result.mode);
      setSource(result.source);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const visible = showAll ? pros : pros.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, pros.length - INITIAL_VISIBLE);

  if (!service) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.sub}>Service not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <StepProgress step={1} total={3} fraction={0.33} />
      <Text style={styles.caption}>
        Pros · {mode ?? '…'}
        {source === 'fallback' ? ' · offline mock' : ''}
      </Text>
      <Text style={styles.title}>{service.name}</Text>
      <View style={styles.seg}>
        {(
          [
            { id: 'match' as const, label: 'Match me' },
            { id: 'pick' as const, label: 'Pick a pro' },
          ] as const
        ).map((m) => (
          <Pressable
            key={m.id}
            onPress={() => setBookMode(m.id)}
            style={[styles.segBtn, bookMode === m.id && styles.segBtnOn]}
          >
            <Text
              style={[styles.segText, bookMode === m.id && styles.segTextOn]}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sub}>
        {loading
          ? 'Loading…'
          : bookMode === 'match'
            ? "We'll assign the best available pro"
            : `${pros.length} pros · tap to book`}
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.purple} style={{ marginTop: 32 }} />
      ) : bookMode === 'match' ? (
        <View style={{ marginTop: 24 }}>
          <PrimaryButton
            label="Continue"
            onPress={() => {
              const top = pros[0];
              if (!top) return;
              router.push(`/book/when/${top.id}/${service.id}?match=1`);
            }}
          />
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <TextLink
              label="Pick a pro instead"
              onPress={() => setBookMode('pick')}
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {visible.map((pro) => (
              <ProCard key={pro.id} pro={pro} serviceId={service.id} />
            ))}
            {pros.length === 0 && (
              <Text style={styles.sub}>No pros for this service yet.</Text>
            )}
          </View>

          {!showAll && hiddenCount > 0 ? (
            <View style={styles.more}>
              <TextLink
                label={`Show more (${hiddenCount})`}
                onPress={() => setShowAll(true)}
              />
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 48 },
  caption: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: 8,
  },
  sub: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 8,
  },
  seg: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: radii.button,
    padding: 2,
  },
  segBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  segBtnOn: {
    backgroundColor: colors.purple,
    borderRadius: radii.button,
  },
  segText: { ...typography.small, color: colors.secondary, fontWeight: '600' },
  segTextOn: { color: colors.white },
  list: { marginTop: 24, gap: spacing.cardGap },
  more: { marginTop: 20, alignItems: 'center' },
});
