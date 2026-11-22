import { ScreenCard } from '@/components/ui/ScreenCard';
import { TextLink } from '@/components/ui/TextLink';
import { colors, spacing, typography } from '@/constants/theme';
import {
  DEMO_BOOKING_ID,
  ensureDemoBooking,
  listBookings,
  saveBooking,
  type StoredBooking,
} from '@/lib/booking-storage';
import {
  fetchBookingsList,
  type ApiBooking,
} from '@/lib/catalog-client';
import { useMarket } from '@/components/market/MarketProvider';
import { getProById } from '@/lib/mock-pros';
import { getServiceById } from '@/lib/services';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Row = {
  id: string;
  title: string;
  meta: string;
  fromApi: boolean;
};

function apiToRow(b: ApiBooking, formatMoney: (n: number) => string): Row {
  const pro = getProById(b.pro_id);
  const service = getServiceById(b.service_id);
  const when = new Date(b.scheduled_at).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  return {
    id: b.id,
    title: `${service?.name ?? b.service_id} · ${pro?.display_name ?? b.pro_id}`,
    meta: `${when} · ${b.status} · ${formatMoney(b.total_price)}`,
    fromApi: true,
  };
}

function localToRow(b: StoredBooking): Row {
  const when = new Date(b.scheduledAt).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  return {
    id: b.id,
    title:
      b.id === DEMO_BOOKING_ID
        ? 'Demo tracking'
        : `${b.serviceName} · ${b.proName}`,
    meta: `${when} · ${b.trackingStatus ?? 'pending'}`,
    fromApi: false,
  };
}

function hydrateLocalFromApi(b: ApiBooking): void {
  if (listBookings().some((x) => x.id === b.id)) return;
  const pro = getProById(b.pro_id);
  const service = getServiceById(b.service_id);
  saveBooking({
    id: b.id,
    proId: b.pro_id,
    serviceId: b.service_id,
    proName: pro?.display_name ?? 'Pro',
    proInitials: pro?.initials,
    serviceName: service?.name ?? b.service_id,
    scheduledAt: b.scheduled_at,
    address: b.address_text,
    notes: b.notes ?? null,
    isEmergency: b.is_emergency,
    servicePrice: b.total_price,
    emergencyFee: 0,
    durationMins: service?.duration_mins ?? 60,
    totalPrice: b.total_price,
    depositAmount: b.deposit_amount,
    depositPaid: b.deposit_paid,
    trackingStatus: 'pending',
  });
}

export default function BookingsScreen() {
  const { formatMoney } = useMarket();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [mode, setMode] = useState<'live' | 'mock' | null>(null);
  const [source, setSource] = useState<'api' | 'fallback' | null>(null);

  const refresh = useCallback(async () => {
    ensureDemoBooking();
    const remote = await fetchBookingsList();
    setMode(remote.mode);
    setSource(remote.source);

    if (remote.source === 'api') {
      for (const b of remote.bookings) hydrateLocalFromApi(b);
    }

    const byId = new Map<string, Row>();
    for (const b of remote.bookings) {
      byId.set(b.id, apiToRow(b, formatMoney));
    }
    for (const b of listBookings()) {
      if (!byId.has(b.id)) byId.set(b.id, localToRow(b));
    }
    setRows([...byId.values()]);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <View style={styles.wrap}>
      <ScreenCard>
        <Text style={styles.caption}>
          Bookings · {mode ?? '…'}
          {source === 'fallback' ? ' · offline' : ''}
        </Text>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.body}>Track active and past appointments.</Text>

        {rows.length === 0 ? (
          <Text style={styles.body}>No bookings yet.</Text>
        ) : (
          rows.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => router.push(`/bookings/${row.id}`)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowMeta}>
                {row.meta}
                {row.fromApi ? ' · api' : ''}
              </Text>
            </Pressable>
          ))
        )}

        <View style={{ marginTop: 20 }}>
          <TextLink
            label="Refresh"
            onPress={() => void refresh()}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <TextLink
            label="Open demo · On the way"
            onPress={() => {
              ensureDemoBooking();
              router.push(`/bookings/${DEMO_BOOKING_ID}?status=on_the_way`);
            }}
          />
        </View>
      </ScreenCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.screen,
  },
  caption: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { ...typography.display, color: colors.text, marginTop: 8 },
  body: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTitle: { ...typography.bodyBold, color: colors.text },
  rowMeta: { ...typography.small, color: colors.secondary, marginTop: 2 },
});
