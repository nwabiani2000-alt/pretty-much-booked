import { useMarket } from '@/components/market/MarketProvider';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/** Stub payouts — mirrors web /pro/dashboard/payouts. */
const ROWS = [
  { id: '1', label: 'Week of 10 Nov', amount: 186.5, status: 'paid' },
  { id: '2', label: 'Week of 17 Nov', amount: 93.5, status: 'scheduled' },
  { id: '3', label: 'Tips (this week)', amount: 18, status: 'pending' },
];

export default function ProPayoutsScreen() {
  const { formatMoney } = useMarket();
  const router = useRouter();
  const pending = ROWS.filter((r) => r.status !== 'paid').reduce(
    (s, r) => s + r.amount,
    0
  );
  const paid = ROWS.filter((r) => r.status === 'paid').reduce(
    (s, r) => s + r.amount,
    0
  );

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <TextLink label="Dashboard" onPress={() => router.back()} />
      <Text style={styles.title}>Payouts</Text>
      <Text style={styles.sub}>Stub ledger — Connect / Paystack later</Text>
      <View style={styles.earnRow}>
        <View>
          <Text style={styles.amt}>{formatMoney(pending)}</Text>
          <Text style={styles.muted}>Pending</Text>
        </View>
        <View>
          <Text style={styles.amt}>{formatMoney(paid)}</Text>
          <Text style={styles.muted}>Paid</Text>
        </View>
      </View>
      {ROWS.map((r) => (
        <View key={r.id} style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>{r.label}</Text>
            <Text style={styles.muted}>{r.status}</Text>
          </View>
          <Text style={styles.rowAmt}>{formatMoney(r.amount)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.card },
  content: { padding: spacing.screen, paddingBottom: 48 },
  title: { ...typography.display, color: colors.text, marginTop: 24 },
  sub: { ...typography.small, color: colors.secondary, marginTop: 8 },
  earnRow: { flexDirection: 'row', gap: 40, marginTop: 32 },
  amt: { ...typography.title, color: colors.text, fontWeight: '700' },
  muted: { ...typography.small, color: colors.secondary, marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginTop: 8,
  },
  rowTitle: { ...typography.bodyBold, color: colors.text },
  rowAmt: { ...typography.bodyBold, color: colors.text },
});
