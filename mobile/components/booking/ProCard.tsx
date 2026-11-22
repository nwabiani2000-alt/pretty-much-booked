import { colors, radii, spacing, typography } from '@/constants/theme';
import { useMarket } from '@/components/market/MarketProvider';
import { proBadge, type MockProListing } from '@/lib/mock-pros';
import { formatDuration } from '@/lib/services';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  pro: MockProListing;
  serviceId: string;
};

export function ProCard({ pro, serviceId }: Props) {
  const { formatMoney } = useMarket();
  const router = useRouter();
  const offering = pro.offerings[serviceId];
  if (!offering) return null;
  const firstName = pro.display_name.split(' ')[0];
  const badge = proBadge(pro.pro_score);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push(`/book/when/${pro.id}/${serviceId}` as `/book/when/${string}/${string}`)
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{pro.initials}</Text>
        </View>
        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{pro.display_name}</Text>
            {pro.is_verified ? <Text style={styles.check}>✓</Text> : null}
          </View>
          <Text style={styles.sub}>
            {pro.rating.toFixed(1)}
            {pro.reviews != null ? ` · ${pro.reviews} reviews` : ''}
            {pro.distance_miles != null ? ` · ${pro.distance_miles} mi` : ''}
          </Text>
        </View>
        {badge.tone === 'gold' ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badge.label} {pro.pro_score}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoney(offering.price)}</Text>
        <Text style={styles.duration}>{formatDuration(offering.duration_mins)}</Text>
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaText}>{`Book ${firstName}`}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.small,
    fontWeight: '700',
    color: colors.purple,
  },
  meta: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...typography.bodyBold, color: colors.text },
  check: { color: colors.purple, fontWeight: '700' },
  sub: { ...typography.small, color: colors.secondary, marginTop: 2 },
  badge: {
    backgroundColor: '#FBF6E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.badge,
  },
  badgeText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 16,
  },
  price: { fontSize: 28, fontWeight: '700', color: colors.text },
  duration: { ...typography.small, color: colors.secondary },
  cta: {
    marginTop: 20,
    height: 56,
    borderRadius: radii.button,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { ...typography.bodyBold, color: colors.white },
});
