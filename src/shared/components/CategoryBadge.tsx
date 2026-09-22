import { StyleSheet, View } from 'react-native';
import { colors } from '@shared/theme';
import { CategoryIcon, type CategoryIconKind } from './CategoryIcon';

export interface CategoryBadgeProps {
  kind: CategoryIconKind;
  size?: number;
  muted?: boolean;
}

export function CategoryBadge({
  kind,
  size = 36,
  muted = false,
}: CategoryBadgeProps) {
  const color = muted ? colors.textSecondary : colors.accent;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: muted ? colors.border : colors.accent,
        },
      ]}
    >
      <CategoryIcon kind={kind} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
