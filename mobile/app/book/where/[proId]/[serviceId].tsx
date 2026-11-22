import { MarketToggle } from '@/components/market/MarketToggle';
import { useMarket } from '@/components/market/MarketProvider';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenCard } from '@/components/ui/ScreenCard';
import { StepProgress } from '@/components/ui/StepProgress';
import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import {
  DEPOSIT_RATE,
  EMERGENCY_FEE,
  getProById,
} from '@/lib/mock-pros';
import { prepChecklist } from '@/lib/prep-checklist';
import { getServiceById } from '@/lib/services';
import {
  defaultZone,
  travelFeeGbp,
  zonesForMarket,
  type TravelZoneId,
} from '@/lib/travel-zones';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STYLE_PRESETS = ['Soft glam', 'Natural', 'Bold colour', 'Protective style'];

export default function WhereScreen() {
  const { formatMoney, market, marketId } = useMarket();
  const router = useRouter();
  const params = useLocalSearchParams<{
    proId: string;
    serviceId: string;
    date?: string;
    hour?: string;
    emergency?: string;
    match?: string;
  }>();
  const pro = getProById(params.proId ?? '');
  const service = getServiceById(params.serviceId ?? '');
  const offering = pro?.offerings[params.serviceId ?? ''];
  const emergency = params.emergency === '1';
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [styleNotes, setStyleNotes] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [travelZone, setTravelZone] = useState<TravelZoneId>(defaultZone(marketId));
  const [prepOk, setPrepOk] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTravelZone(defaultZone(marketId));
  }, [marketId]);

  if (!pro || !service || !offering) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.meta}>Booking not found</Text>
      </View>
    );
  }

  const travel = travelFeeGbp(marketId, travelZone);
  const total = offering.price + (emergency ? EMERGENCY_FEE : 0) + travel;
  const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;
  const prep = prepChecklist(service.category);
  const zones = zonesForMarket(marketId);

  function onContinue() {
    if (!address.trim()) {
      setError('Address required');
      return;
    }
    if (!prepOk) {
      setError("Confirm you'll be ready");
      return;
    }
    setError(null);
    router.push({
      pathname: '/book/pay',
      params: {
        proId: pro!.id,
        serviceId: service!.id,
        proName:
          params.match === '1' ? 'Matched pro' : pro!.display_name,
        serviceName: service!.name,
        address: address.trim(),
        notes: notes.trim(),
        styleNotes: styleNotes.trim(),
        inspiration: labels.join('|'),
        date: params.date ?? '',
        hour: params.hour ?? '',
        emergency: emergency ? '1' : '0',
        match: params.match ?? '0',
        travelZone,
        travelFee: String(travel),
        total: String(total),
        deposit: String(deposit),
        prep: '1',
      },
    });
  }

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <StepProgress step={3} total={3} fraction={0.78} />
          <MarketToggle />
        </View>
        <Text style={styles.meta}>
          {pro.display_name} · {service.name}
        </Text>
        <Text style={styles.priceLine}>
          <Text style={styles.priceBold}>{formatMoney(total)}</Text>
          <Text style={styles.meta}> · deposit {formatMoney(deposit)}</Text>
        </Text>

        <ScreenCard style={{ marginTop: 16 }}>
          <Text style={styles.title}>Where?</Text>

          <Text style={styles.fieldLabel}>Address</Text>
          <TextInput
            value={address}
            onChangeText={(t) => {
              setAddress(t);
              if (error) setError(null);
            }}
            placeholder="Address"
            placeholderTextColor={colors.muted}
            style={[styles.input, error && !address.trim() ? styles.inputError : null]}
            autoComplete="street-address"
          />
          <View style={{ marginTop: 8, alignItems: 'flex-start' }}>
            <TextLink
              label="Use my location"
              onPress={() => {
                setAddress(market.defaultAddress);
                setError(null);
              }}
            />
          </View>

          <Text style={styles.fieldLabel}>Travel zone</Text>
          {zones.map((z) => {
            const on = travelZone === z.id;
            return (
              <Pressable
                key={z.id}
                onPress={() => setTravelZone(z.id)}
                style={[styles.zoneRow, on && styles.zoneOn]}
              >
                <View>
                  <Text style={styles.zoneTitle}>{z.label}</Text>
                  <Text style={styles.zoneHint}>{z.hint}</Text>
                </View>
                <Text style={styles.zoneFee}>
                  {z.feeGbp === 0 ? 'Included' : `+${formatMoney(z.feeGbp)}`}
                </Text>
              </Pressable>
            );
          })}

          <Text style={styles.fieldLabel}>Inspiration</Text>
          <View style={styles.chips}>
            {STYLE_PRESETS.map((p) => {
              const on = labels.includes(p);
              return (
                <Pressable
                  key={p}
                  onPress={() =>
                    setLabels((prev) =>
                      on ? prev.filter((x) => x !== p) : [...prev, p].slice(0, 4)
                    )
                  }
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={styleNotes}
            onChangeText={setStyleNotes}
            placeholder="Style notes"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.textarea]}
            multiline
          />

          <Text style={styles.fieldLabel}>Prep</Text>
          {prep.map((item) => (
            <Text key={item.id} style={styles.prepItem}>
              · {item.label}
            </Text>
          ))}
          <Pressable
            onPress={() => setPrepOk((v) => !v)}
            style={[styles.prepCheck, prepOk && styles.prepCheckOn]}
          >
            <Text style={[styles.chipText, prepOk && styles.chipTextOn]}>
              {prepOk ? '✓ ' : ''}I&apos;ll be ready
            </Text>
          </Pressable>

          {!showNotes ? (
            <View style={{ marginTop: 24, alignItems: 'flex-start' }}>
              <TextLink
                label="Access notes (optional)"
                onPress={() => setShowNotes(true)}
              />
            </View>
          ) : (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.fieldLabel}>Access notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Gate code, parking…"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.textarea]}
                multiline
              />
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScreenCard>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 120 },
  meta: { ...typography.small, color: colors.secondary, marginTop: 20 },
  priceLine: { marginTop: 4 },
  priceBold: { ...typography.bodyBold, color: colors.text },
  title: { ...typography.display, color: colors.text },
  fieldLabel: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 28,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.input,
    paddingVertical: 10,
    ...typography.body,
    color: colors.text,
  },
  inputError: { borderBottomColor: '#DC2626' },
  textarea: { minHeight: 64, textAlignVertical: 'top' },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radii.button,
    backgroundColor: colors.bg,
    marginTop: 8,
  },
  zoneOn: { backgroundColor: colors.purpleLight },
  zoneTitle: { ...typography.bodyBold, color: colors.text },
  zoneHint: { ...typography.caption, color: colors.secondary, marginTop: 2 },
  zoneFee: { ...typography.small, color: colors.purple, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    backgroundColor: colors.bg,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.purple },
  chipText: { ...typography.small, color: colors.secondary, fontWeight: '500' },
  chipTextOn: { color: colors.white },
  prepItem: { ...typography.small, color: colors.text, marginTop: 6 },
  prepCheck: {
    marginTop: 12,
    padding: 12,
    borderRadius: radii.button,
    backgroundColor: colors.bg,
  },
  prepCheckOn: { backgroundColor: colors.purple },
  error: { ...typography.small, color: '#DC2626', marginTop: 16 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.screen,
    backgroundColor: colors.card,
  },
});
