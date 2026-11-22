import { MarketToggle } from '@/components/market/MarketToggle';
import { HOME_CATEGORIES, colors, radii, spacing, typography } from '@/constants/theme';
import { apiFetch } from '@/lib/api';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ServicesResponse = {
  mode: 'live' | 'mock';
  count: number;
  services: { id: string; category: string; name: string }[];
};

export default function HomeScreen() {
  const [apiMode, setApiMode] = useState<'live' | 'mock' | '…'>('…');
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    void apiFetch('/api/services')
      .then((r) => r.json())
      .then((data: ServicesResponse) => {
        setApiMode(data.mode);
        const next: Record<string, number> = {};
        for (const s of data.services ?? []) {
          next[s.category] = (next[s.category] ?? 0) + 1;
        }
        setCounts(next);
      })
      .catch(() => setApiMode('mock'));
  }, []);

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>
              Pretty Much Booked · catalog {apiMode}
            </Text>
            <MarketToggle />
          </View>
          <Text style={styles.title}>What do you need?</Text>

          <View style={styles.list}>
            {HOME_CATEGORIES.map((cat, i) => (
              <Link key={cat.id} href={`/book/${cat.id}`} asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.row,
                    i === HOME_CATEGORIES.length - 1 && styles.rowLast,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <Text style={styles.rowLabel}>{cat.label}</Text>
                  {counts[cat.id] != null ? (
                    <Text style={styles.rowMeta}>
                      {counts[cat.id]} services
                    </Text>
                  ) : null}
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.card,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  brand: {
    ...typography.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: spacing.section,
  },
  list: {
    marginTop: spacing.section,
  },
  row: {
    minHeight: 56,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 16,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  rowLabel: {
    ...typography.title,
    color: colors.text,
  },
  rowMeta: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 2,
  },
});
