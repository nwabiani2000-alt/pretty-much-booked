import { colors, radii, typography } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  progress: number;
  etaMins: number;
  proLabel: string;
  address: string;
};

/** CSS map placeholder — matches web Mapbox fallback aesthetic. */
export function TrackingMapStub({
  progress,
  etaMins,
  proLabel,
  address,
}: Props) {
  const left = `${Math.min(92, Math.max(6, progress * 100))}%` as `${number}%`;
  return (
    <View style={styles.wrap}>
      <View style={styles.map}>
        <View style={styles.road} />
        <View style={[styles.pinHome, { left: '88%' }]}>
          <Text style={styles.pinText}>⌂</Text>
        </View>
        <View style={[styles.pinPro, { left }]}>
          <Text style={styles.pinProText}>{proLabel.slice(0, 2)}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={styles.eta}>{etaMins} min</Text>
        <Text style={styles.sub}>ETA · {address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  map: {
    height: 180,
    borderRadius: radii.card,
    backgroundColor: '#E8E4F0',
    overflow: 'hidden',
    position: 'relative',
  },
  road: {
    position: 'absolute',
    top: '48%',
    left: '8%',
    right: '8%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    opacity: 0.7,
  },
  pinHome: {
    position: 'absolute',
    top: '38%',
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: { fontSize: 14, color: colors.purple },
  pinPro: {
    position: 'absolute',
    top: '36%',
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinProText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.white,
  },
  meta: { marginTop: 12, paddingHorizontal: 4 },
  eta: { fontSize: 28, fontWeight: '700', color: colors.text },
  sub: { ...typography.small, color: colors.secondary, marginTop: 2 },
});
