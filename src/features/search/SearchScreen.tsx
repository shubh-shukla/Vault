import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { colors, spacing } from '@shared/theme';
import { useVaultSearch } from './useVaultSearch';
import type { SearchableEntry, SearchableEntryType } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const DETAIL_ROUTE_BY_ENTRY_TYPE: Record<
  SearchableEntryType,
  keyof RootStackParamList
> = {
  wifiCredentials: 'WifiCredentialDetail',
  licenseKeys: 'LicenseKeyDetail',
  recoveryCodes: 'RecoveryCodeDetail',
  importantNumbers: 'ImportantNumberDetail',
  deviceDetails: 'DeviceDetailDetail',
  secureNotes: 'SecureNoteDetail',
};

export function SearchScreen({ navigation }: Props) {
  const { query, setQuery, results, isIndexing } = useVaultSearch();

  const handlePressResult = (result: SearchableEntry) => {
    const routeName = DETAIL_ROUTE_BY_ENTRY_TYPE[result.entryType];
    // Every detail route shares the same { id?: string } param shape, but
    // react-navigation's `navigate` overloads are keyed per literal route
    // name, which doesn't fit a route chosen dynamically at runtime.
    (navigation.navigate as (name: string, params: { id: string }) => void)(
      routeName,
      {
        id: result.entryId,
      },
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoFocus
      />

      {isIndexing && <Text style={styles.statusText}>Indexing…</Text>}

      {!isIndexing && query.trim().length > 0 && results.length === 0 && (
        <Text style={styles.statusText}>No matches.</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={item => `${item.entryType}:${item.entryId}`}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            style={styles.row}
            onPress={() => handlePressResult(item)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.xs,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
