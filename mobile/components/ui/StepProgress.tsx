import { colors, typography } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  step: number;
  total?: number;
  fraction?: number;
  label?: string;
};

export function StepProgress({
  step,
  total = 3,
  fraction,
  label,
}: Props) {
  const width = `${Math.round((fraction ?? step / total) * 100)}%` as `${number}%`;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label ?? `Step ${step} of ${total}`}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: 2,
  },
});
