import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@shared/theme';

export interface FieldRowProps {
  label: string;
  value: string;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
