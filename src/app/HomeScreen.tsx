import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { colors, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface MenuEntry {
  label: string;
  onPress: (navigation: Props['navigation']) => void;
}

const MENU_ENTRIES: MenuEntry[] = [
  {
    label: 'Wi-Fi Credentials',
    onPress: navigation => navigation.navigate('WifiCredentialsList'),
  },
  {
    label: 'License Keys',
    onPress: navigation => navigation.navigate('LicenseKeysList'),
  },
  {
    label: 'Recovery Codes',
    onPress: navigation => navigation.navigate('RecoveryCodesList'),
  },
  {
    label: 'Important Numbers',
    onPress: navigation => navigation.navigate('ImportantNumbersList'),
  },
  {
    label: 'Device Details',
    onPress: navigation => navigation.navigate('DeviceDetailsList'),
  },
  {
    label: 'Secure Notes',
    onPress: navigation => navigation.navigate('SecureNotesList'),
  },
  {
    label: 'Backup',
    onPress: navigation => navigation.navigate('Backup'),
  },
];

function SearchButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={styles.searchButtonText}>Search</Text>
    </Pressable>
  );
}

export function HomeScreen({ navigation }: Props) {
  useLayoutEffect(() => {
    navigation.setOptions({
      // react-navigation's headerRight option is always a render function,
      // not a JSX element, so this can't be hoisted the way a JSX prop could be.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <SearchButton onPress={() => navigation.navigate('Search')} />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {MENU_ENTRIES.map(entry => (
        <Pressable
          key={entry.label}
          accessibilityRole="button"
          style={styles.row}
          onPress={() => entry.onPress(navigation)}
        >
          <Text style={styles.rowLabel}>{entry.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  searchButtonText: {
    ...typography.bodyEmphasis,
    color: colors.accent,
  },
});
