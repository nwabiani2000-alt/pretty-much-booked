import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenCard } from '@/components/ui/ScreenCard';
import { StepProgress } from '@/components/ui/StepProgress';
import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { combineDateAndHour, formatHourLabel } from '@/lib/booking-time';
import {
  markDepositPaid,
  saveBooking,
  type StoredBooking,
} from '@/lib/booking-storage';
import { createBookingRemote } from '@/lib/catalog-client';
import { useMarket } from '@/components/market/MarketProvider';
import { MarketToggle } from '@/components/market/MarketToggle';
import { cancelPolicyLines } from '@/lib/cancel-policy';
import { EMERGENCY_FEE, getProById } from '@/lib/mock-pros';
import { getServiceById } from '@/lib/services';
import { tipPresetsGbp } from '@/lib/tips';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/** Pay / deposit stub → POST /api/bookings → confirmation. */
export default function PayStubScreen() {
  const { formatMoney, emergencyLabel, marketId } = useMarket();
  const router = useRouter();
  const p = useLocalSearchParams<{
    proId?: string;
    serviceId?: string;
    proName?: string;
    serviceName?: string;
    address?: string;
    notes?: string;
    styleNotes?: string;
    inspiration?: string;
    date?: string;
    hour?: string;
    emergency?: string;
    match?: string;
    travelZone?: string;
    travelFee?: string;
    total?: string;
    deposit?: string;
  }>();
  const [paying, setPaying] = useState(false);
  const [apiNote, setApiNote] = useState<string | null>(null);
  const [tipGbp, setTipGbp] = useState(0);
  const [policyOpen, setPolicyOpen] = useState(false);
  const baseTotal = Number(p.total ?? 0);
  const total = baseTotal + tipGbp;
  const deposit = Math.round(total * 0.3 * 100) / 100;
  const tipPresets = useMemo(() => tipPresetsGbp(marketId), [marketId]);
  const policy = useMemo(
    () => cancelPolicyLines(marketId, formatMoney),
    [marketId, formatMoney]
  );
  const hour = p.hour ? Number(p.hour) : null;
  const whenLabel =
    p.date && hour !== null && !Number.isNaN(hour)
      ? `${new Date(p.date).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })} · ${formatHourLabel(hour)}`
      : 'Scheduled';

  async function onPay() {
    setPaying(true);
    setApiNote(null);
    const pro = getProById(p.proId ?? '');
    const service = getServiceById(p.serviceId ?? '');
    const offering = pro?.offerings[p.serviceId ?? ''];
    const emergency = p.emergency === '1';
    const scheduledAt =
      p.date && hour !== null && !Number.isNaN(hour)
        ? combineDateAndHour(new Date(p.date), hour).toISOString()
        : new Date().toISOString();

    const remote = await createBookingRemote({
      pro_id: p.proId || pro?.id || '1',
      service_id: p.serviceId || service?.id || 'box-braids',
      scheduled_at: scheduledAt,
      address_text: p.address || 'Address TBD',
      total_price: total,
      deposit_amount: deposit,
      is_emergency: emergency,
      notes: p.notes || null,
      deposit_paid: true,
    });

    const bookingId =
      remote.booking?.id ?? `bk_${Date.now().toString(36)}`;

    if (remote.source === 'api') {
      setApiNote(`Saved · ${remote.mode}`);
    } else {
      setApiNote('Offline · local booking');
    }

    const travelFee = Number(p.travelFee ?? 0);
    const booking: StoredBooking = {
      id: bookingId,
      proId: p.proId || pro?.id || '1',
      serviceId: p.serviceId || service?.id || 'box-braids',
      proName: p.proName || pro?.display_name || 'Pro',
      proInitials: pro?.initials,
      proPhone: `+44 7700 900${String(p.proId || '1').padStart(2, '0')}`,
      serviceName: p.serviceName || service?.name || 'Service',
      scheduledAt,
      address: p.address || remote.booking?.address_text || '',
      notes: p.notes || null,
      styleNotes: p.styleNotes || null,
      inspirationLabels: p.inspiration
        ? p.inspiration.split('|').filter(Boolean)
        : [],
      isEmergency: emergency,
      matchMode: p.match === '1' ? 'match' : 'pick',
      travelZone: p.travelZone,
      travelFee,
      tipAmount: tipGbp,
      prepAcknowledged: true,
      servicePrice:
        offering?.price ??
        total - (emergency ? EMERGENCY_FEE : 0) - travelFee - tipGbp,
      emergencyFee: emergency ? EMERGENCY_FEE : 0,
      durationMins: offering?.duration_mins ?? 60,
      totalPrice: total,
      depositAmount: deposit,
      depositPaid: true,
      trackingStatus: 'pending',
    };
    saveBooking(booking);
    markDepositPaid(bookingId);

    setTimeout(() => {
      setPaying(false);
      router.replace(`/book/confirmation/${bookingId}`);
    }, 500);
  }

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
          <MarketToggle />
        </View>
        <StepProgress step={3} total={3} fraction={1} label="Pay deposit" />
        <Text style={styles.meta}>
          {p.proName} · {p.serviceName}
        </Text>

        <ScreenCard style={{ marginTop: 16 }}>
          <Text style={styles.title}>Pay</Text>
          <Text style={styles.body}>
            Secure the booking with a 30% deposit.
          </Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>When</Text>
            <Text style={styles.rowValue}>{whenLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Where</Text>
            <Text style={styles.rowValue}>{p.address || '—'}</Text>
          </View>
          {p.emergency === '1' ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>ASAP</Text>
              <Text style={styles.badge}>{emergencyLabel}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total</Text>
            <Text style={styles.rowValue}>{formatMoney(total)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.depositLabel}>Deposit due</Text>
            <Text style={styles.depositValue}>{formatMoney(deposit)}</Text>
          </View>

          <Text style={[styles.rowLabel, { marginTop: 20 }]}>
            Tip (100% to pro)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <Pressable
              onPress={() => setTipGbp(0)}
              style={[styles.tipChip, tipGbp === 0 && styles.tipChipOn]}
            >
              <Text style={[styles.tipText, tipGbp === 0 && styles.tipTextOn]}>
                None
              </Text>
            </Pressable>
            {tipPresets.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTipGbp(t)}
                style={[styles.tipChip, tipGbp === t && styles.tipChipOn]}
              >
                <Text
                  style={[styles.tipText, tipGbp === t && styles.tipTextOn]}
                >
                  {formatMoney(t)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setPolicyOpen((v) => !v)} style={{ marginTop: 20 }}>
            <Text style={styles.linkish}>Cancellation policy</Text>
          </Pressable>
          {policyOpen
            ? policy.map((line) => (
                <Text key={line} style={styles.policyLine}>
                  {line}
                </Text>
              ))
            : null}

          <View style={styles.mockCard}>
            <Text style={styles.mockTitle}>Card (stub)</Text>
            <Text style={styles.mockLine}>···· ···· ···· 4242</Text>
            <Text style={styles.mockLine}>12/28 · ···</Text>
          </View>
          {apiNote ? <Text style={styles.apiNote}>{apiNote}</Text> : null}
        </ScreenCard>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={paying ? '…' : `Pay ${formatMoney(deposit)}`}
          disabled={paying}
          onPress={() => void onPay()}
        />
        <View style={{ marginTop: 12 }}>
          <TextLink label="Cancel" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 140 },
  meta: { ...typography.small, color: colors.secondary, marginTop: 20 },
  title: { ...typography.display, color: colors.text, marginTop: 4 },
  body: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { ...typography.small, color: colors.secondary },
  rowValue: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  depositLabel: { ...typography.bodyBold, color: colors.text },
  depositValue: { ...typography.heading, color: colors.purple },
  tipChip: {
    backgroundColor: colors.bg,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tipChipOn: { backgroundColor: colors.purple },
  tipText: { ...typography.small, color: colors.secondary, fontWeight: '500' },
  tipTextOn: { color: colors.white },
  linkish: { ...typography.small, color: colors.purple, fontWeight: '600' },
  policyLine: {
    ...typography.caption,
    color: colors.secondary,
    marginTop: 6,
  },
  badge: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
  },
  mockCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: radii.button,
    backgroundColor: colors.bg,
  },
  mockTitle: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mockLine: {
    ...typography.body,
    color: colors.text,
    marginTop: 8,
    letterSpacing: 1,
  },
  apiNote: {
    ...typography.caption,
    color: colors.purple,
    marginTop: 12,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.screen,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
});
