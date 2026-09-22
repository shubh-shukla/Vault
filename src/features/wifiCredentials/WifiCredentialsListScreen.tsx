import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { colors, spacing } from '@shared/theme';
import { useWifiCredentials } from './useWifiCredentials';
import type { WifiCredential } from './types';

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

  if (isLoading) {
    return null;
  }

  if (credentials.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Wi-Fi credentials yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={credentials}
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
