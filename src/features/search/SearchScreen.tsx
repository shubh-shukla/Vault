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
import { CategoryBadge } from '@shared/components/CategoryBadge';
import type { CategoryIconKind } from '@shared/components/CategoryIcon';
import { colors, radius, spacing, typography } from '@shared/theme';
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

const ICON_BY_ENTRY_TYPE: Record<SearchableEntryType, CategoryIconKind> = {
  wifiCredentials: 'wifi',
  licenseKeys: 'key',
  recoveryCodes: 'code',
  importantNumbers: 'phone',
  deviceDetails: 'device',
  secureNotes: 'note',
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
            <CategoryBadge
              kind={ICON_BY_ENTRY_TYPE[item.entryType]}
              size={28}
            />
            <View style={styles.rowText}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
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
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
