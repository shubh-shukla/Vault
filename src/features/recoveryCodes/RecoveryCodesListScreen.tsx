import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { colors, spacing, typography } from '@shared/theme';
import { useRecoveryCodes } from './useRecoveryCodes';
import type { RecoveryCodeEntry } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecoveryCodesList'>;

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={styles.addButtonText}>Add</Text>
    </Pressable>
  );
}

export function RecoveryCodesListScreen({ navigation }: Props) {
  const { entries, isLoading } = useRecoveryCodes();

  useLayoutEffect(() => {
    navigation.setOptions({
      // react-navigation's headerRight option is always a render function,
      // not a JSX element, so this can't be hoisted the way a JSX prop could be.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <AddButton
          onPress={() => navigation.navigate('RecoveryCodeDetail', {})}
        />
      ),
    });
  }, [navigation]);

  if (isLoading) {
    return null;
  }

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recovery codes yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }: { item: RecoveryCodeEntry }) => (
        <Pressable
          accessibilityRole="button"
          style={styles.row}
          onPress={() =>
            navigation.navigate('RecoveryCodeDetail', { id: item.id })
          }
        >
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <Text style={styles.codeCount}>
            {item.codes.length} code{item.codes.length === 1 ? '' : 's'}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  serviceName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  codeCount: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  addButtonText: {
    ...typography.bodyEmphasis,
    color: colors.accent,
  },
});
