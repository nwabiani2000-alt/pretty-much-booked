/** Pretty Much Booked — mobile design tokens (aligned with web). */
export const colors = {
  purple: '#5B2C87',
  purplePressed: '#4A1F6B',
  purpleLight: '#F5F0FA',
  gold: '#D4AF37',
  text: '#000000',
  secondary: '#6B7280',
  muted: '#9CA3AF',
  bg: '#FAFAFA',
  card: '#FFFFFF',
  border: '#F3F4F6',
  input: '#E5E7EB',
  white: '#FFFFFF',
} as const;

export const spacing = {
  card: 24,
  cardGap: 16,
  screen: 20,
  section: 32,
} as const;

export const radii = {
  card: 20,
  button: 12,
  input: 8,
  badge: 9999,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
} as const;

export const HOME_CATEGORIES = [
  { id: 'hair', label: 'Hair' },
  { id: 'nails', label: 'Nails' },
  { id: 'makeup', label: 'Makeup' },
] as const;

export type HomeCategoryId = (typeof HOME_CATEGORIES)[number]['id'];
