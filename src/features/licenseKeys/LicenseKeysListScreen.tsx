import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { colors, spacing, typography } from '@shared/theme';
import { useLicenseKeys } from './useLicenseKeys';
import type { LicenseKey } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'LicenseKeysList'>;

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={styles.addButtonText}>Add</Text>
    </Pressable>
  );
}

export function LicenseKeysListScreen({ navigation }: Props) {
  const { licenseKeys, isLoading } = useLicenseKeys();

  useLayoutEffect(() => {
    navigation.setOptions({
      // react-navigation's headerRight option is always a render function,
      // not a JSX element, so this can't be hoisted the way a JSX prop could be.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <AddButton
          onPress={() => navigation.navigate('LicenseKeyDetail', {})}
        />
      ),
    });
  }, [navigation]);

  if (isLoading) {
    return null;
  }

  if (licenseKeys.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No license keys yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={licenseKeys}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }: { item: LicenseKey }) => (
        <Pressable
          accessibilityRole="button"
          style={styles.row}
          onPress={() =>
            navigation.navigate('LicenseKeyDetail', { id: item.id })
          }
        >
          <Text style={styles.productName}>{item.productName}</Text>
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
  productName: {
    ...typography.body,
    color: colors.textPrimary,
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
