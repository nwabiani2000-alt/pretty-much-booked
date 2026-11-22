import { useMarket } from '@/components/market/MarketProvider';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import {
  computeEarnings,
  formatBookingWhen,
  loadAvailability,
  loadProBookings,
  saveAvailability,
  setProBookingStatus,
  statusLabel,
  type ProAvailabilityState,
  type ProBooking,
} from '@/lib/pro-dashboard';
import { loadProDraft } from '@/lib/pro-onboarding';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProDashboardScreen() {
  const { formatMoney, market } = useMarket();
  const router = useRouter();
  const [name, setName] = useState('Pro');
  const [bookings, setBookings] = useState<ProBooking[]>([]);
  const [avail, setAvail] = useState<ProAvailabilityState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadProDraft();
    setName(draft.displayName || 'Pro');
    setBookings(loadProBookings());
    setAvail(loadAvailability());
  }, []);

  const earnings = useMemo(() => computeEarnings(bookings), [bookings]);
  const today = bookings.filter(
    (b) => b.whenLabel === 'today' && b.status !== 'declined'
  );
  const upcoming = bookings.filter(
    (b) => b.whenLabel === 'upcoming' && b.status !== 'declined'
  );
  const pendingFirst = bookings.find((b) => b.status === 'pending');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  if (!avail) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <View style={styles.top}>
        <Text style={styles.logo}>PMB</Text>
        <TextLink
          label="Services"
          onPress={() => router.push('/pro/onboarding?step=services')}
        />
      </View>

      <Text style={styles.title}>Hi, {name.split(' ')[0]}</Text>

      <Pressable
        onPress={() => {
          const next = { ...avail, availableNow: !avail.availableNow };
          saveAvailability(next);
          setAvail(next);
        }}
        style={styles.availRow}
      >
        <View>
          <Text style={styles.availTitle}>Available now</Text>
          <Text style={styles.muted}>
            {avail.availableNow ? 'Taking new jobs' : 'Paused'}
          </Text>
        </View>
        <View
          style={[styles.toggle, avail.availableNow && styles.toggleOn]}
        >
          <View
            style={[styles.knob, avail.availableNow && styles.knobOn]}
          />
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 24, marginTop: 4 }}>
        <TextLink
          label="Edit hours"
          onPress={() => router.push('/pro/hours')}
        />
        <TextLink
          label="Payouts"
          onPress={() => router.push('/pro/payouts')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Earnings</Text>
        <View style={styles.earnRow}>
          <View>
            <Text style={styles.earnAmt}>{formatMoney(earnings.week)}</Text>
            <Text style={styles.muted}>This week</Text>
          </View>
          <View>
            <Text style={styles.earnAmt}>{formatMoney(earnings.total)}</Text>
            <Text style={styles.muted}>Total</Text>
          </View>
        </View>
      </View>

      {pendingFirst ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Needs reply</Text>
          <Text style={styles.pendingName}>{pendingFirst.customerName}</Text>
          <Text style={styles.muted}>
            {pendingFirst.serviceName} ·{' '}
            {formatBookingWhen(pendingFirst.scheduledAt)}
            {pendingFirst.isEmergency ? ' · ASAP' : ''}
          </Text>
          <Text style={styles.muted}>
            {formatMoney(pendingFirst.price)} · {pendingFirst.address}
          </Text>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label="Accept"
              onPress={() => {
                setProBookingStatus(pendingFirst.id, 'accepted');
                setBookings(loadProBookings());
                showToast('Accepted');
              }}
            />
          </View>
          <View style={styles.linkRow}>
            <TextLink
              label="Decline"
              onPress={() => {
                setProBookingStatus(pendingFirst.id, 'declined');
                setBookings(loadProBookings());
                showToast('Declined');
              }}
            />
            <TextLink
              label="Details"
              onPress={() =>
                router.push(`/pro/bookings/${pendingFirst.id}`)
              }
            />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Today</Text>
        {today.length === 0 ? (
          <Text style={styles.empty}>Nothing today</Text>
        ) : (
          today.map((b) => <BookingRow key={b.id} booking={b} />)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Upcoming</Text>
        {upcoming.length === 0 ? (
          <Text style={styles.empty}>No upcoming</Text>
        ) : (
          upcoming.map((b) => <BookingRow key={b.id} booking={b} />)
        )}
      </View>

      <View style={{ marginTop: 32, alignItems: 'center' }}>
        <TextLink
          label="Customer app"
          onPress={() => router.replace('/')}
        />
      </View>
    </ScrollView>
  );
}

function BookingRow({ booking }: { booking: ProBooking }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/pro/bookings/${booking.id}`)}
      style={styles.bookingRow}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.bookingName}>{booking.customerName}</Text>
        <Text style={styles.muted}>
          {booking.serviceName} · {formatBookingWhen(booking.scheduledAt)}
        </Text>
      </View>
      <Text
        style={[
          styles.status,
          booking.status === 'pending' && { color: colors.purple },
        ]}
      >
        {statusLabel(booking.status)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.card },
  content: { padding: spacing.screen, paddingBottom: 48 },
  toast: {
    alignSelf: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  toastText: { ...typography.small, color: colors.white },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    ...typography.caption,
    color: colors.purple,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: { ...typography.display, color: colors.text, marginTop: 28 },
  availRow: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  availTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  muted: { ...typography.small, color: colors.secondary, marginTop: 2 },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 4,
  },
  toggleOn: { backgroundColor: colors.purple },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  knobOn: { alignSelf: 'flex-end' },
  section: { marginTop: 36 },
  sectionLabel: { ...typography.small, color: colors.secondary },
  earnRow: { flexDirection: 'row', gap: 40, marginTop: 12 },
  earnAmt: { fontSize: 32, fontWeight: '700', color: colors.text },
  pendingName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  linkRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  empty: { ...typography.body, color: colors.text, marginTop: 12 },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  bookingName: { fontWeight: '600', color: colors.text },
  status: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
});
