import { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { colors, spacing } from '@shared/theme';
import { useEntryIdsForTag, useTags } from '@features/tags';
import { useWifiCredentials } from './useWifiCredentials';
import type { WifiCredential } from './types';

const ENTRY_TYPE = 'wifiCredentials';

type Props = NativeStackScreenProps<RootStackParamList, 'WifiCredentialsList'>;

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={styles.addButtonText}>Add</Text>
    </Pressable>
  );
}

export function WifiCredentialsListScreen({ navigation }: Props) {
  const { credentials, isLoading } = useWifiCredentials();
  const { tags } = useTags();
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const matchingEntryIds = useEntryIdsForTag(ENTRY_TYPE, selectedTagId);

  useLayoutEffect(() => {
    navigation.setOptions({
      // react-navigation's headerRight option is always a render function,
      // not a JSX element, so this can't be hoisted the way a JSX prop could be.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <AddButton
          onPress={() => navigation.navigate('WifiCredentialDetail', {})}
        />
      ),
    });
  }, [navigation]);

  const visibleCredentials = useMemo(
    () =>
      selectedTagId === null
        ? credentials
        : credentials.filter(c => matchingEntryIds.has(c.id)),
    [credentials, selectedTagId, matchingEntryIds],
  );

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.flex}>
      {tags.length > 0 && (
        <View style={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            style={[
              styles.filterChip,
              selectedTagId === null && styles.filterChipActive,
            ]}
            onPress={() => setSelectedTagId(null)}
          >
            <Text style={styles.filterChipText}>All</Text>
          </Pressable>
          {tags.map(tag => (
            <Pressable
              key={tag.id}
              accessibilityRole="button"
              style={[
                styles.filterChip,
                selectedTagId === tag.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedTagId(tag.id)}
            >
              <Text style={styles.filterChipText}>{tag.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {visibleCredentials.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {credentials.length === 0
              ? 'No Wi-Fi credentials yet.'
              : 'No matches for this tag.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleCredentials}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: WifiCredential }) => (
            <Pressable
              accessibilityRole="button"
              style={styles.row}
              onPress={() =>
                navigation.navigate('WifiCredentialDetail', { id: item.id })
              }
            >
              <Text style={styles.ssid}>{item.ssid}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ssid: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  addButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
