import { useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { CategoryBadge } from '@shared/components/CategoryBadge';
import { colors, spacing, typography } from '@shared/theme';
import { useImportantNumbers } from './useImportantNumbers';
import type { ImportantNumberEntry } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'ImportantNumbersList'>;

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={styles.addButtonText}>Add</Text>
    </Pressable>
  );
}

export function ImportantNumbersListScreen({ navigation }: Props) {
  const { entries, isLoading } = useImportantNumbers();

  useLayoutEffect(() => {
    navigation.setOptions({
      // react-navigation's headerRight option is always a render function,
      // not a JSX element, so this can't be hoisted the way a JSX prop could be.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <AddButton
          onPress={() => navigation.navigate('ImportantNumberDetail', {})}
        />
      ),
    });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CategoryBadge glyph="#" size={44} />
        <Text style={styles.emptyText}>No important numbers yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }: { item: ImportantNumberEntry }) => (
        <Pressable
          accessibilityRole="button"
          style={styles.row}
          onPress={() =>
            navigation.navigate('ImportantNumberDetail', { id: item.id })
          }
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.chevron}>›</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  chevron: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
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
