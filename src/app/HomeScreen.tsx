import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { CategoryBadge } from '@shared/components/CategoryBadge';
import { colors, spacing, typography } from '@shared/theme';
import { useWifiCredentials } from '@features/wifiCredentials';
import { useLicenseKeys } from '@features/licenseKeys';
import { useRecoveryCodes } from '@features/recoveryCodes';
import { useImportantNumbers } from '@features/importantNumbers';
import { useDeviceDetails } from '@features/deviceDetails';
import { useSecureNotes } from '@features/secureNotes';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface MenuEntry {
  label: string;
  glyph: string;
  count: number;
  onPress: (navigation: Props['navigation']) => void;
}

function SearchButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Text style={styles.searchButtonText}>Search</Text>
    </Pressable>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { credentials } = useWifiCredentials();
  const { licenseKeys } = useLicenseKeys();
  const { entries: recoveryCodes } = useRecoveryCodes();
  const { entries: importantNumbers } = useImportantNumbers();
  const { entries: deviceDetails } = useDeviceDetails();
  const { entries: secureNotes } = useSecureNotes();

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

  const menuEntries: MenuEntry[] = [
    {
      label: 'Wi-Fi Credentials',
      glyph: 'W',
      count: credentials.length,
      onPress: nav => nav.navigate('WifiCredentialsList'),
    },
    {
      label: 'License Keys',
      glyph: 'K',
      count: licenseKeys.length,
      onPress: nav => nav.navigate('LicenseKeysList'),
    },
    {
      label: 'Recovery Codes',
      glyph: 'R',
      count: recoveryCodes.length,
      onPress: nav => nav.navigate('RecoveryCodesList'),
    },
    {
      label: 'Important Numbers',
      glyph: '#',
      count: importantNumbers.length,
      onPress: nav => nav.navigate('ImportantNumbersList'),
    },
    {
      label: 'Device Details',
      glyph: 'D',
      count: deviceDetails.length,
      onPress: nav => nav.navigate('DeviceDetailsList'),
    },
    {
      label: 'Secure Notes',
      glyph: 'N',
      count: secureNotes.length,
      onPress: nav => nav.navigate('SecureNotesList'),
    },
  ];

  return (
    <View style={styles.container}>
      {menuEntries.map(entry => (
        <Pressable
          key={entry.label}
          accessibilityRole="button"
          style={styles.row}
          onPress={() => entry.onPress(navigation)}
        >
          <CategoryBadge glyph={entry.glyph} />
          <Text style={styles.rowLabel}>{entry.label}</Text>
          <Text style={styles.rowCount}>{entry.count}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      <View style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        style={styles.utilityRow}
        onPress={() => navigation.navigate('Backup')}
      >
        <Text style={styles.utilityLabel}>Backup</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  rowCount: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chevron: {
    ...typography.body,
    color: colors.textSecondary,
  },
  divider: {
    height: spacing.lg,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  utilityLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  searchButtonText: {
    ...typography.bodyEmphasis,
    color: colors.accent,
  },
});
