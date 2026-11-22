import { Timeline } from '@/components/booking/Timeline';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenCard } from '@/components/ui/ScreenCard';
import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import {
  ensureDemoBooking,
  loadBooking,
  type StoredBooking,
} from '@/lib/booking-storage';
import { useMarket } from '@/components/market/MarketProvider';
import {
  shouldOfferWhatsApp,
  whatsappConfirmUrl,
} from '@/lib/whatsapp';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const CONFIRM_SECONDS = 10 * 60;

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ConfirmationScreen() {
  const { formatMoney, marketId } = useMarket();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(CONFIRM_SECONDS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let data = loadBooking(id ?? '');
    if (!data && id) {
      // Deep-link / screenshot path — seed demo with this id
      data = ensureDemoBooking(id);
    }
    setBooking(data);
  }, [id]);

  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  if (!booking) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.body}>Booking not found.</Text>
      </View>
    );
  }

  const whenLabel = new Date(booking.scheduledAt).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  function stub(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <ScreenCard>
        <View style={styles.check}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>{"You're booked!"}</Text>
        <Text style={styles.centerSub}>
          Deposit {formatMoney(booking.depositAmount)} · total{' '}
          {formatMoney(booking.totalPrice)}
        </Text>
        {booking.isEmergency ? (
          <View style={styles.asapWrap}>
            <Text style={styles.asap}>ASAP</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 36 }}>
          <Text style={styles.proName}>{booking.proName}</Text>
          <Text style={styles.body}>{booking.serviceName}</Text>
          <Text style={[styles.when, { marginTop: 12 }]}>{whenLabel}</Text>
          <Text style={styles.body}>{booking.address}</Text>
          {booking.proPhone ? (
            <Text style={styles.phone}>{booking.proPhone}</Text>
          ) : null}
        </View>

        <View style={{ marginTop: 28 }}>
          <Text style={styles.wait}>Waiting for pro to confirm…</Text>
          <Text style={styles.countdown}>{formatCountdown(secondsLeft)}</Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <Timeline activeIndex={0} />
        </View>

        <View style={{ marginTop: 32 }}>
          {shouldOfferWhatsApp(marketId) ? (
            <PrimaryButton
              label="Confirm on WhatsApp"
              onPress={() => {
                void Linking.openURL(
                  whatsappConfirmUrl({
                    bookingId: booking.id,
                    serviceName: booking.serviceName,
                    proName: booking.proName,
                    whenLabel,
                    address: booking.address,
                  })
                );
              }}
            />
          ) : (
            <PrimaryButton
              label="View booking"
              onPress={() => router.push(`/bookings/${booking.id}`)}
            />
          )}
          <View style={styles.linkRow}>
            {shouldOfferWhatsApp(marketId) ? (
              <TextLink
                label="View booking"
                onPress={() => router.push(`/bookings/${booking.id}`)}
              />
            ) : null}
            <TextLink
              label="Message Pro"
              onPress={() => router.push('/messages/msg_aisha')}
            />
            <TextLink
              label="Add to Calendar"
              onPress={() => stub('Calendar stub')}
            />
          </View>
        </View>
      </ScreenCard>

      <ScreenCard style={{ marginTop: spacing.cardGap }}>
        <Text style={styles.heading}>What happens next</Text>
        <Text style={styles.nextItem}>
          <Text style={styles.nextBold}>1. Pro confirms</Text> — within ~10 min
        </Text>
        <Text style={styles.nextItem}>
          <Text style={styles.nextBold}>2. On the way</Text> — track ETA
        </Text>
        <Text style={styles.nextItem}>
          <Text style={styles.nextBold}>3. Service</Text> — rate when done
        </Text>
      </ScreenCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 48 },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.badge,
    marginBottom: 12,
  },
  toastText: { ...typography.small, color: colors.white },
  check: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  checkMark: { fontSize: 36, color: colors.white, fontWeight: '700' },
  title: {
    ...typography.display,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  centerSub: {
    ...typography.small,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  asapWrap: { alignItems: 'center', marginTop: 12 },
  asap: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    backgroundColor: '#FBF6E9',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.badge,
  },
  proName: { ...typography.heading, color: colors.text },
  body: { ...typography.small, color: colors.secondary, marginTop: 2 },
  when: { ...typography.body, color: colors.text },
  phone: {
    ...typography.small,
    color: colors.purple,
    marginTop: 12,
    fontWeight: '600',
  },
  wait: { ...typography.bodyBold, color: colors.text },
  countdown: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '700',
    color: colors.purple,
    fontVariant: ['tabular-nums'],
  },
  linkRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  heading: { ...typography.heading, color: colors.text },
  nextItem: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 12,
  },
  nextBold: { fontWeight: '600', color: colors.text },
});
