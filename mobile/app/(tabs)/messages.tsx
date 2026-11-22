import { ScreenCard } from '@/components/ui/ScreenCard';
import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import {
  clearThreads,
  loadThreads,
  restoreSeedThreads,
  type MessageThread,
} from '@/lib/messages';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function MessagesTabScreen() {
  const router = useRouter();
  const { empty } = useLocalSearchParams<{ empty?: string }>();
  const [threads, setThreads] = useState<MessageThread[]>([]);

  const refresh = useCallback(() => {
    if (empty === '1') {
      clearThreads();
      setThreads([]);
      return;
    }
    setThreads(loadThreads());
  }, [empty]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.sub}>Chat with your pro about the booking</Text>

        {threads.length === 0 ? (
          <ScreenCard style={{ marginTop: 28 }}>
            <View style={styles.emptyIcon}>
              <View style={styles.emptyBubble}>
                <View style={styles.emptyDot} />
                <View style={styles.emptyDot} />
                <View style={styles.emptyDot} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyBody}>
              When you book, you can message your pro here about timing, access,
              and prep.
            </Text>
            <View style={{ marginTop: 24 }}>
              <TextLink
                label="Browse services"
                onPress={() => router.push('/')}
              />
            </View>
            <View style={{ marginTop: 16 }}>
              <TextLink
                label="Show sample inbox"
                onPress={() => {
                  restoreSeedThreads();
                  router.replace('/messages');
                  setThreads(loadThreads());
                }}
              />
            </View>
          </ScreenCard>
        ) : (
          <View style={styles.list}>
            {threads.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/messages/${t.id}`)}
                style={({ pressed }) => [
                  styles.row,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{t.peerInitials}</Text>
                </View>
                <View style={styles.meta}>
                  <View style={styles.rowTop}>
                    <Text style={styles.name}>{t.peerName}</Text>
                    <Text style={styles.time}>{t.timeLabel}</Text>
                  </View>
                  {t.bookingLabel ? (
                    <Text style={styles.booking}>{t.bookingLabel}</Text>
                  ) : null}
                  <Text
                    style={[styles.preview, t.unread && styles.previewUnread]}
                    numberOfLines={1}
                  >
                    {t.preview}
                  </Text>
                </View>
                {t.unread ? <View style={styles.dot} /> : null}
              </Pressable>
            ))}
            <View style={{ marginTop: 28, alignItems: 'center' }}>
              <TextLink
                label="Clear inbox (empty state)"
                onPress={() => {
                  clearThreads();
                  setThreads([]);
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.screen, paddingBottom: 40 },
  title: { ...typography.display, color: colors.text },
  sub: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 8,
  },
  list: { marginTop: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.small,
    fontWeight: '700',
    color: colors.purple,
  },
  meta: { flex: 1, minWidth: 0 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: { ...typography.bodyBold, color: colors.text },
  time: { ...typography.caption, color: colors.muted },
  booking: {
    ...typography.caption,
    color: colors.purple,
    fontWeight: '600',
    marginTop: 2,
  },
  preview: {
    ...typography.small,
    color: colors.secondary,
    marginTop: 4,
  },
  previewUnread: { color: colors.text, fontWeight: '600' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple,
  },
  emptyIcon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBubble: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple,
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyBody: {
    ...typography.small,
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
