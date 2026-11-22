import { colors, typography } from '@/constants/theme';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

type Props = PressableProps & { label: string };

export function TextLink({ label, ...props }: Props) {
  return (
    <Pressable accessibilityRole="button" {...props}>
      {({ pressed }) => (
        <Text style={[styles.link, pressed && { opacity: 0.7 }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    ...typography.small,
    color: colors.purple,
    fontWeight: '600',
    textAlign: 'center',
  },
});
