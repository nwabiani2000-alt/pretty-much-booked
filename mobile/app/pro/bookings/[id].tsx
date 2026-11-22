import { useMarket } from '@/components/market/MarketProvider';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import {
  formatBookingWhen,
  loadProBookings,
  setProBookingStatus,
  statusLabel,
  type ProBooking,
} from '@/lib/pro-dashboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProBookingDetailScreen() {
  const { formatMoney, market } = useMarket();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<ProBooking | null>(null);

  useEffect(() => {
    setBooking(loadProBookings().find((b) => b.id === id) ?? null);
  }, [id]);

  if (!booking) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.sub}>Booking not found</Text>
        <TextLink label="Dashboard" onPress={() => router.replace('/pro/dashboard')} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.status}>{statusLabel(booking.status)}</Text>
      <Text style={styles.title}>{booking.customerName}</Text>
      <Text style={styles.sub}>
        {booking.serviceName} · {formatBookingWhen(booking.scheduledAt)}
      </Text>
      <Text style={[styles.sub, { marginTop: 16 }]}>{booking.address}</Text>
      <Text style={styles.price}>
        {formatMoney(booking.price)}
        <Text style={styles.sub}> · deposit {formatMoney(booking.deposit)}</Text>
      </Text>
      {booking.isEmergency ? (
        <Text style={styles.asap}>ASAP</Text>
      ) : null}

      {booking.status === 'pending' ? (
        <View style={{ marginTop: 32, gap: 12 }}>
          <PrimaryButton
            label="Accept"
            onPress={() => {
              setProBookingStatus(booking.id, 'accepted');
              setBooking(loadProBookings().find((b) => b.id === id) ?? null);
            }}
          />
          <TextLink
            label="Decline"
            onPress={() => {
              setProBookingStatus(booking.id, 'declined');
              router.replace('/pro/dashboard');
            }}
          />
        </View>
      ) : null}

      {booking.status === 'accepted' ? (
        <View style={{ marginTop: 32 }}>
          <PrimaryButton
            label="On the way"
            onPress={() => {
              setProBookingStatus(booking.id, 'on_the_way');
              setBooking(loadProBookings().find((b) => b.id === id) ?? null);
            }}
          />
        </View>
      ) : null}

      <View style={{ marginTop: 24 }}>
        <TextLink
          label="Back to dashboard"
          onPress={() => router.replace('/pro/dashboard')}
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
  status: {
    ...typography.small,
    color: colors.purple,
    fontWeight: '600',
    marginTop: 8,
  },
  title: { ...typography.display, color: colors.text, marginTop: 8 },
  sub: { ...typography.small, color: colors.secondary, marginTop: 6 },
  price: {
    ...typography.heading,
    color: colors.text,
    marginTop: 24,
  },
  asap: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    marginTop: 8,
  },
});
