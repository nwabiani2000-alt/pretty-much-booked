import { colors, radii, typography } from '@/constants/theme';
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

type Props = PressableProps & {
  label: string;
};

/** 56px solid purple CTA — one primary hierarchy. */
export function PrimaryButton({ label, disabled, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...props}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    width: '100%',
    borderRadius: radii.button,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.purplePressed,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    backgroundColor: colors.input,
  },
  label: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
