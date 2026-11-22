import { ScreenCard } from '@/components/ui/ScreenCard';
import {
  HOME_CATEGORIES,
  colors,
  spacing,
  typography,
  type HomeCategoryId,
} from '@/constants/theme';
import { useMarket } from '@/components/market/MarketProvider';
import { MarketToggle } from '@/components/market/MarketToggle';
import { apiFetch } from '@/lib/api';
import {
  formatDuration,
  getPopularServices,
  type Service,
} from '@/lib/services';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/** Hick’s Law: pick one service — tap navigates; no secondary CTA. */
export default function BookCategoryScreen() {
  const { formatFromPrice } = useMarket();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const id = (HOME_CATEGORIES.find((c) => c.id === category)?.id ??
    'hair') as HomeCategoryId;
  const label = HOME_CATEGORIES.find((c) => c.id === id)?.label ?? 'Book';
  const [services, setServices] = useState<Service[]>(() =>
    getPopularServices(id)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'live' | 'mock' | null>(null);

  useEffect(() => {
    void apiFetch(`/api/services?category=${id}`)
      .then((r) => r.json())
      .then((data: { mode?: 'live' | 'mock'; services?: Service[] }) => {
        if (data.services && data.services.length > 0) {
          setServices(data.services);
          setMode(data.mode ?? 'mock');
        } else {
          setMode('mock');
        }
      })
      .catch(() => setMode('mock'));
  }, [id]);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <ScreenCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.caption}>
            Catalog · {mode ?? '…'}
          </Text>
          <MarketToggle />
        </View>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.sub}>Pick one</Text>

        {services.map((s) => {
          const active = selectedId === s.id;
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              onPress={() => {
                setSelectedId(s.id);
                setTimeout(() => {
                  router.push(`/book/pros/${s.id}`);
                }, 160);
              }}
              style={({ pressed }) => [
                styles.row,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.rowTitle, active && styles.active]}>
                {s.name}
              </Text>
              <Text style={styles.rowMeta}>
                {formatFromPrice(s.base_price)} · {formatDuration(s.duration_mins)}
              </Text>
            </Pressable>
          );
        })}
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
    marginBottom: 8,
  },
  row: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { ...typography.heading, color: colors.text },
  active: { color: colors.purple },
  rowMeta: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 2,
  },
});
