import { ScreenCard } from '@/components/ui/ScreenCard';
import { StepProgress } from '@/components/ui/StepProgress';
import { colors, radii, spacing, typography } from '@/constants/theme';
import {
  formatDayLabel,
  formatHourLabel,
  nextFourteenDays,
  sameDay,
  standardTimeSlots,
} from '@/lib/booking-time';
import { useMarket } from '@/components/market/MarketProvider';
import { MarketToggle } from '@/components/market/MarketToggle';
import {
  DEPOSIT_RATE,
  EMERGENCY_FEE,
  getProById,
} from '@/lib/mock-pros';
import { getServiceById } from '@/lib/services';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function WhenScreen() {
  const { formatMoney, emergencyLabel, market } = useMarket();
  const router = useRouter();
  const { proId, serviceId } = useLocalSearchParams<{
    proId: string;
    serviceId: string;
  }>();
  const pro = getProById(proId ?? '');
  const service = getServiceById(serviceId ?? '');
  const offering = pro?.offerings[serviceId ?? ''];
  const days = useMemo(() => nextFourteenDays(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(days[0]!);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [emergency, setEmergency] = useState(false);

  if (!pro || !service || !offering) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.meta}>Booking not found</Text>
      </View>
    );
  }

  const total = offering.price + (emergency ? EMERGENCY_FEE : 0);
  const deposit = Math.round(total * DEPOSIT_RATE * 100) / 100;

  function goWhere(date: Date, hour: number) {
    setSelectedHour(hour);
    setTimeout(() => {
      router.push({
        pathname: '/book/where/[proId]/[serviceId]',
        params: {
          proId: pro!.id,
          serviceId: service!.id,
          date: date.toISOString(),
          hour: String(hour),
          emergency: emergency ? '1' : '0',
        },
      });
    }, 140);
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
          <MarketToggle />
        </View>
        <StepProgress step={2} total={3} fraction={0.55} />
      <Text style={styles.meta}>
        {pro.display_name} · {service.name}
      </Text>
      <Text style={styles.priceLine}>
        <Text style={styles.priceBold}>{formatMoney(total)}</Text>
        <Text style={styles.meta}> · deposit {formatMoney(deposit)}</Text>
        {emergency ? <Text style={styles.asap}>  ASAP</Text> : null}
      </Text>

      <ScreenCard style={{ marginTop: 16 }}>
        <Text style={styles.title}>When?</Text>

        {!emergency && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.days}
              style={{ marginTop: 24 }}
            >
              {days.map((day) => {
                const active = sameDay(selectedDate, day);
                return (
                  <Pressable
                    key={day.toISOString()}
                    onPress={() => {
                      setSelectedDate(day);
                      setSelectedHour(null);
                    }}
                    style={styles.day}
                  >
                    <Text style={styles.dayLabel}>{formatDayLabel(day)}</Text>
                    <View
                      style={[styles.dayCircle, active && styles.dayCircleOn]}
                    >
                      <Text
                        style={[styles.dayNum, active && styles.dayNumOn]}
                      >
                        {day.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.slots}>
              {standardTimeSlots().map((hour) => {
                const active = selectedHour === hour;
                return (
                  <Pressable
                    key={hour}
                    onPress={() => goWhere(selectedDate, hour)}
                    style={styles.slot}
                  >
                    <Text style={[styles.slotText, active && styles.active]}>
                      {formatHourLabel(hour)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {emergency && (
          <View style={[styles.slots, { marginTop: 24 }]}>
            {[2, 3, 4, 5].map((offset) => {
              const d = new Date();
              d.setHours(d.getHours() + offset, 0, 0, 0);
              return (
                <Pressable
                  key={offset}
                  onPress={() => goWhere(d, d.getHours())}
                  style={styles.slot}
                >
                  <Text style={styles.dayLabel}>{formatDayLabel(d)}</Text>
                  <Text style={styles.slotText}>
                    {formatHourLabel(d.getHours())}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() => setEmergency((v) => !v)}
          style={[styles.asapRow, emergency && styles.asapRowOn]}
        >
          <Text style={styles.asapLabel}>
            {emergency ? 'Standard times' : 'Need this ASAP?'}
          </Text>
          {emergency ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{emergencyLabel}</Text>
            </View>
          ) : null}
        </Pressable>
      </ScreenCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 48 },
  meta: { ...typography.small, color: colors.secondary, marginTop: 20 },
  priceLine: { marginTop: 4 },
  priceBold: { ...typography.bodyBold, color: colors.text },
  asap: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
  },
  title: { ...typography.display, color: colors.text },
  days: { gap: 8, paddingVertical: 4 },
  day: { alignItems: 'center', minWidth: 56, paddingHorizontal: 4 },
  dayLabel: { ...typography.caption, color: colors.secondary },
  dayCircle: {
    marginTop: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleOn: { backgroundColor: colors.purple },
  dayNum: { ...typography.heading, color: colors.text },
  dayNumOn: { color: colors.white },
  slots: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slot: {
    width: '33.33%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  slotText: { ...typography.bodyBold, color: colors.text },
  active: { color: colors.purple },
  asapRow: {
    marginTop: 32,
    minHeight: 48,
    borderRadius: radii.button,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  asapRowOn: { backgroundColor: colors.purpleLight },
  asapLabel: { ...typography.small, color: colors.text },
  badge: {
    backgroundColor: '#FBF6E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.badge,
  },
  badgeText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
  },
});
