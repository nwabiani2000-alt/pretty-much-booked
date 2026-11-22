export type MessageThread = {
  id: string;
  peerName: string;
  peerInitials: string;
  preview: string;
  timeLabel: string;
  unread: boolean;
  bookingLabel?: string;
};

export type ThreadMessage = {
  id: string;
  from: 'me' | 'them';
  text: string;
  timeLabel: string;
};

const THREADS_KEY = 'pmb_message_threads';

export const SEED_THREADS: MessageThread[] = [
  {
    id: 'msg_aisha',
    peerName: 'Aisha B.',
    peerInitials: 'AB',
    preview: 'See you at 2 — I’ll text when I’m close.',
    timeLabel: '12:40',
    unread: true,
    bookingLabel: 'Box Braids · Today',
  },
  {
    id: 'msg_nia',
    peerName: 'Nia O.',
    peerInitials: 'NO',
    preview: 'Thanks for booking. Any parking notes?',
    timeLabel: 'Yesterday',
    unread: false,
    bookingLabel: 'Silk Press · Tomorrow',
  },
  {
    id: 'msg_keisha',
    peerName: 'Keisha M.',
    peerInitials: 'KM',
    preview: 'Soft glam kit ready.',
    timeLabel: 'Mon',
    unread: false,
    bookingLabel: 'Soft Glam · Mon',
  },
];

export const THREAD_MESSAGES: Record<string, ThreadMessage[]> = {
  msg_aisha: [
    {
      id: '1',
      from: 'them',
      text: 'Hi! Confirmed for Box Braids today at 2.',
      timeLabel: '12:10',
    },
    {
      id: '2',
      from: 'me',
      text: 'Perfect — flat 2, buzzer 14.',
      timeLabel: '12:18',
    },
    {
      id: '3',
      from: 'them',
      text: 'See you at 2 — I’ll text when I’m close.',
      timeLabel: '12:40',
    },
  ],
  msg_nia: [
    {
      id: '1',
      from: 'them',
      text: 'Thanks for booking. Any parking notes?',
      timeLabel: 'Yesterday',
    },
  ],
  msg_keisha: [
    {
      id: '1',
      from: 'them',
      text: 'Soft glam kit ready.',
      timeLabel: 'Mon',
    },
  ],
};

let memory: MessageThread[] | null = null;

function ssGet(key: string): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') return sessionStorage.getItem(key);
  } catch {
    /* ignore */
  }
  return null;
}

function ssSet(key: string, value: string): void {
  try {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function loadThreads(): MessageThread[] {
  if (memory) return memory.map((t) => ({ ...t }));
  try {
    const raw = ssGet(THREADS_KEY);
    if (raw === '[]') {
      memory = [];
      return [];
    }
    if (!raw) {
      memory = SEED_THREADS.map((t) => ({ ...t }));
      ssSet(THREADS_KEY, JSON.stringify(memory));
      return memory.map((t) => ({ ...t }));
    }
    memory = JSON.parse(raw) as MessageThread[];
    return memory.map((t) => ({ ...t }));
  } catch {
    memory = SEED_THREADS.map((t) => ({ ...t }));
    return memory.map((t) => ({ ...t }));
  }
}

export function saveThreads(threads: MessageThread[]): void {
  memory = threads;
  ssSet(THREADS_KEY, JSON.stringify(threads));
}

export function clearThreads(): void {
  saveThreads([]);
}

export function restoreSeedThreads(): void {
  saveThreads(SEED_THREADS.map((t) => ({ ...t })));
}

export function getThread(id: string): MessageThread | undefined {
  return loadThreads().find((t) => t.id === id) ?? SEED_THREADS.find((t) => t.id === id);
}

export function getThreadMessages(id: string): ThreadMessage[] {
  return THREAD_MESSAGES[id] ?? [
    {
      id: 'stub',
      from: 'them',
      text: 'Messaging stub — real chat lands next.',
      timeLabel: 'Now',
    },
  ];
}
