import { colors } from './theme';

const tintColorLight = colors.purple;

export default {
  light: {
    text: colors.text,
    background: colors.bg,
    tint: tintColorLight,
    tabIconDefault: colors.muted,
    tabIconSelected: tintColorLight,
  },
  // App forces light premium UI — dark mirrors light tokens
  dark: {
    text: colors.text,
    background: colors.bg,
    tint: tintColorLight,
    tabIconDefault: colors.muted,
    tabIconSelected: tintColorLight,
  },
};
