import { colors, typography } from '@/constants/theme';
import { TIMELINE_STEPS } from '@/lib/booking-storage';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  /** 0-based active index */
  activeIndex: number;
};

export function Timeline({ activeIndex }: Props) {
  return (
    <View style={styles.row}>
      {TIMELINE_STEPS.map((label, i) => {
        const done = i <= activeIndex;
        return (
          <View key={label} style={styles.item}>
            <View style={[styles.dot, done && styles.dotOn]}>
              <Text style={[styles.dotText, done && styles.dotTextOn]}>
                {done && i < activeIndex ? '✓' : String(i + 1)}
              </Text>
            </View>
            <Text style={[styles.label, done && styles.labelOn]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: colors.purple },
  dotText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
  },
  dotTextOn: { color: colors.white },
  label: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '500',
    color: colors.muted,
    textAlign: 'center',
  },
  labelOn: { color: colors.text },
});
