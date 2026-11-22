import { TextLink } from '@/components/ui/TextLink';
import { colors, radii, spacing, typography } from '@/constants/theme';
import {
  getThread,
  getThreadMessages,
  type ThreadMessage,
} from '@/lib/messages';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function MessageThreadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = useMemo(() => getThread(id ?? ''), [id]);
  const [messages, setMessages] = useState<ThreadMessage[]>(() =>
    getThreadMessages(id ?? '')
  );
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  if (!thread) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.sub}>Conversation not found</Text>
        <TextLink label="Back to Messages" onPress={() => router.replace('/messages')} />
      </View>
    );
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local_${Date.now()}`,
        from: 'me',
        text,
        timeLabel: 'Now',
      },
    ]);
    setDraft('');
    setToast('Sent (stub)');
    setTimeout(() => setToast(null), 1400);
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{thread.peerInitials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{thread.peerName}</Text>
          {thread.bookingLabel ? (
            <Text style={styles.booking}>{thread.bookingLabel}</Text>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.thread}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.from === 'me' ? styles.bubbleMe : styles.bubbleThem,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                m.from === 'me' && styles.bubbleTextMe,
              ]}
            >
              {m.text}
            </Text>
            <Text
              style={[
                styles.bubbleTime,
                m.from === 'me' && styles.bubbleTimeMe,
              ]}
            >
              {m.timeLabel}
            </Text>
          </View>
        ))}
        <Text style={styles.stubNote}>Stub thread — delivery not live yet</Text>
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable
          onPress={send}
          style={({ pressed }) => [
            styles.send,
            pressed && { opacity: 0.85 },
            !draft.trim() && styles.sendDisabled,
          ]}
          disabled={!draft.trim()}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  toast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  toastText: { ...typography.small, color: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screen,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.purple,
  },
  name: { ...typography.bodyBold, color: colors.text },
  booking: {
    ...typography.caption,
    color: colors.secondary,
    marginTop: 2,
  },
  thread: {
    padding: spacing.screen,
    paddingBottom: 24,
    gap: 10,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.purple,
    borderBottomRightRadius: 4,
  },
  bubbleText: { ...typography.body, color: colors.text },
  bubbleTextMe: { color: colors.white },
  bubbleTime: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 4,
  },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.75)' },
  stubNote: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.screen,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.button,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },
  send: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radii.button,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: colors.input },
  sendText: { ...typography.bodyBold, color: colors.white },
  sub: { ...typography.small, color: colors.secondary, margin: spacing.screen },
});
