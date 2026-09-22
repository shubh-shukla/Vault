import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@shared/theme';

export interface CategoryBadgeProps {
  glyph: string;
  size?: number;
}

export function CategoryBadge({ glyph, size = 36 }: CategoryBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.glyph}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    ...typography.label,
    color: colors.accent,
    fontWeight: '700',
  },
});
