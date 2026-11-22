import { Timeline } from '@/components/booking/Timeline';
import { TrackingMapStub } from '@/components/booking/TrackingMapStub';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import {
  DEMO_BOOKING_ID,
  TRACKING_STATUSES,
  ensureDemoBooking,
  loadBooking,
  setTrackingStatus,
  timelineIndex,
  type StoredBooking,
  type TrackingStatus,
} from '@/lib/booking-storage';
import { useMarket } from '@/components/market/MarketProvider';
import { formatDuration } from '@/lib/services';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const INITIAL_ETA = 12;

function statusTitle(status: TrackingStatus, booking: StoredBooking): string {
  const time = new Date(booking.scheduledAt).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  });
  switch (status) {
    case 'pending':
      return 'Waiting for pro';
    case 'confirmed':
      return `See you at ${time}`;
    case 'on_the_way':
      return 'On the way';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'How was it?';
  }
}

export default function BookingTrackingScreen() {
  const { formatMoney } = useMarket();
  const router = useRouter();
  const { id, status: statusParam } = useLocalSearchParams<{
    id: string;
    status?: string;
  }>();
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(0);
  const [etaMins, setEtaMins] = useState(INITIAL_ETA);
  const [progress, setProgress] = useState(0.08);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let data = loadBooking(id ?? '');
    if (!data) {
      data = ensureDemoBooking(id || DEMO_BOOKING_ID);
    }
    const valid = TRACKING_STATUSES.some((s) => s.id === statusParam);
    if (data && valid && statusParam) {
      data =
        setTrackingStatus(data.id, statusParam as TrackingStatus) ?? data;
    }
    setBooking(data);
  }, [id, statusParam]);

  const status: TrackingStatus = booking?.trackingStatus ?? 'pending';

  useEffect(() => {
    if (status !== 'on_the_way') {
      setEtaMins(INITIAL_ETA);
      setProgress(0.08);
      return;
    }
    setEtaMins(INITIAL_ETA);
    setProgress(0.08);
    const tick = setInterval(() => {
      setEtaMins((m) => (m <= 1 ? 1 : m - 1));
      setProgress((p) => Math.min(0.92, p + 0.07));
    }, 2500);
    return () => clearInterval(tick);
  }, [status]);

  useEffect(() => {
    if (status !== 'in_progress') {
      setElapsed(0);
      return;
    }
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, [status]);

  const step = timelineIndex(status);
  const title = useMemo(
    () => (booking ? statusTitle(status, booking) : ''),
    [booking, status]
  );

  function flipStatus(next: TrackingStatus) {
    if (!booking) return;
    const updated = setTrackingStatus(booking.id, next);
    if (updated) {
      setBooking(updated);
      router.setParams({ status: next });
    }
  }

  function stub(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  if (!booking) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.muted}>Booking not found.</Text>
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
  const statusLabel =
    TRACKING_STATUSES.find((s) => s.id === status)?.label ?? status;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <Text style={styles.statusLabel}>{statusLabel}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>
        {booking.proName} · {booking.serviceName}
      </Text>

      {(status === 'on_the_way' || status === 'confirmed') && (
        <View style={{ marginTop: 20 }}>
          <TrackingMapStub
            progress={status === 'on_the_way' ? progress : 0.05}
            etaMins={status === 'on_the_way' ? etaMins : INITIAL_ETA}
            proLabel={booking.proInitials ?? booking.proName}
            address={booking.address}
          />
          {status === 'confirmed' ? (
            <Text style={[styles.muted, { marginTop: 8 }]}>
              Map ready when they leave
            </Text>
          ) : null}
        </View>
      )}

      <View style={{ marginTop: 28 }}>
        <Timeline activeIndex={step} />
      </View>

      <View style={{ marginTop: 32 }}>
        <Text style={styles.muted}>When</Text>
        <Text style={styles.detail}>{whenLabel}</Text>
        <Text style={[styles.muted, { marginTop: 16 }]}>Where</Text>
        <Text style={styles.detail}>{booking.address}</Text>

        {status !== 'pending' && booking.proPhone ? (
          <Text style={styles.phone}>
            Call {booking.proName.split(' ')[0]}
          </Text>
        ) : null}
        {status === 'pending' ? (
          <View style={{ marginTop: 20, alignItems: 'flex-start' }}>
            <TextLink
              label="Cancel booking"
              onPress={() => stub('Cancel soon')}
            />
          </View>
        ) : null}
      </View>

      {status === 'in_progress' && (
        <View style={styles.centerBlock}>
          <Text style={styles.muted}>Timer</Text>
          <Text style={styles.timer}>
            {Math.floor(elapsed / 60)
              .toString()
              .padStart(2, '0')}
            :{(elapsed % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.muted}>
            {formatDuration(booking.durationMins || 60)} booked
          </Text>
          <View style={{ marginTop: 24, width: '100%' }}>
            <PrimaryButton
              label="Done"
              onPress={() => flipStatus('completed')}
            />
          </View>
        </View>
      )}

      {status === 'completed' && (
        <View style={{ marginTop: 32 }}>
          <Text style={styles.muted}>Rate</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <Text
                  style={[
                    styles.star,
                    star <= rating ? styles.starOn : styles.starOff,
                  ]}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
            <TextLink label="Add a tip" onPress={() => stub('Tip soon')} />
          </View>
          <View style={{ marginTop: 24 }}>
            <PrimaryButton
              label={`Rebook ${booking.proName.split(' ')[0]}`}
              onPress={() =>
                router.push(`/book/when/${booking.proId}/${booking.serviceId}`)
              }
            />
          </View>
          <Text style={[styles.muted, { marginTop: 12 }]}>
            Deposit {formatMoney(booking.depositAmount)}
          </Text>
        </View>
      )}

      <View style={styles.demo}>
        <Text style={styles.demoLabel}>Demo</Text>
        <View style={styles.demoRow}>
          {TRACKING_STATUSES.map((s) => (
            <Pressable key={s.id} onPress={() => flipStatus(s.id)}>
              <Text
                style={[
                  styles.demoChip,
                  status === s.id && styles.demoChipOn,
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {status === 'on_the_way' ? (
          <View style={{ marginTop: 12, alignItems: 'flex-start' }}>
            <TextLink
              label="Jump ETA to 1 min"
              onPress={() => {
                setEtaMins(1);
                setProgress(0.9);
              }}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
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
  statusLabel: {
    ...typography.small,
    color: colors.purple,
    fontWeight: '600',
    marginTop: 8,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginTop: 4,
  },
  muted: { ...typography.small, color: colors.secondary, marginTop: 8 },
  detail: { ...typography.body, color: colors.text, marginTop: 4 },
  phone: {
    ...typography.small,
    color: colors.purple,
    fontWeight: '600',
    marginTop: 20,
  },
  centerBlock: { marginTop: 36, alignItems: 'center' },
  timer: {
    marginTop: 8,
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  stars: { flexDirection: 'row', gap: 8, marginTop: 12 },
  star: { fontSize: 32 },
  starOn: { color: colors.gold },
  starOff: { color: 'rgba(0,0,0,0.15)' },
  demo: {
    marginTop: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  demoLabel: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  demoRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  demoChip: {
    ...typography.small,
    color: colors.muted,
    fontWeight: '600',
  },
  demoChipOn: { color: colors.purple },
});
