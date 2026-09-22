import { StyleSheet, View } from 'react-native';
import { colors } from '@shared/theme';
import { CategoryIcon, type CategoryIconKind } from './CategoryIcon';

export interface CategoryBadgeProps {
  kind: CategoryIconKind;
  size?: number;
}

export function CategoryBadge({ kind, size = 36 }: CategoryBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <CategoryIcon kind={kind} size={size * 0.5} color={colors.accent} />
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
});
