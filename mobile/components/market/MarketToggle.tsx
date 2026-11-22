import { useMarket } from '@/components/market/MarketProvider';
import { colors, radii, typography } from '@/constants/theme';
import { MARKETS, type MarketId } from '@/lib/market';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/** London ↔ Lagos — compact segmented control. */
export function MarketToggle() {
  const { marketId, setMarketId } = useMarket();
  const ids = Object.keys(MARKETS) as MarketId[];

  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {ids.map((id) => {
        const active = marketId === id;
        const m = MARKETS[id];
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setMarketId(id)}
            style={[styles.btn, active && styles.btnActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {m.city}
              <Text style={styles.sym}> {m.symbol}</Text>
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radii.button,
    padding: 2,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: colors.card,
    borderRadius: radii.button,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.purple,
  },
  sym: {
    color: colors.muted,
  },
});
