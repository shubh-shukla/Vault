import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { CategoryBadge } from '@shared/components/CategoryBadge';
import { CategoryIcon } from '@shared/components/CategoryIcon';
import type { CategoryIconKind } from '@shared/components/CategoryIcon';
import { colors, radius, spacing, typography } from '@shared/theme';
import { useWifiCredentials } from '@features/wifiCredentials';
import { useLicenseKeys } from '@features/licenseKeys';
import { useRecoveryCodes } from '@features/recoveryCodes';
import { useImportantNumbers } from '@features/importantNumbers';
import { useDeviceDetails } from '@features/deviceDetails';
import { useSecureNotes } from '@features/secureNotes';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface MenuEntry {
  label: string;
  kind: CategoryIconKind;
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
      kind: 'wifi',
      count: credentials.length,
      onPress: nav => nav.navigate('WifiCredentialsList'),
    },
    {
      label: 'License Keys',
      kind: 'key',
      count: licenseKeys.length,
      onPress: nav => nav.navigate('LicenseKeysList'),
    },
    {
      label: 'Recovery Codes',
      kind: 'code',
      count: recoveryCodes.length,
      onPress: nav => nav.navigate('RecoveryCodesList'),
    },
    {
      label: 'Important Numbers',
      kind: 'phone',
      count: importantNumbers.length,
      onPress: nav => nav.navigate('ImportantNumbersList'),
    },
    {
      label: 'Device Details',
      kind: 'device',
      count: deviceDetails.length,
      onPress: nav => nav.navigate('DeviceDetailsList'),
    },
    {
      label: 'Secure Notes',
      kind: 'note',
      count: secureNotes.length,
      onPress: nav => nav.navigate('SecureNotesList'),
    },
  ];

  return (
    <View style={styles.container}>
      <View>
        {menuEntries.map(entry => (
          <Pressable
            key={entry.label}
            accessibilityRole="button"
            style={styles.row}
            onPress={() => entry.onPress(navigation)}
          >
            <CategoryBadge kind={entry.kind} />
            <Text style={styles.rowLabel}>{entry.label}</Text>
            <Text style={styles.rowCount}>{entry.count}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.backupButton}
        onPress={() => navigation.navigate('Backup')}
      >
        <CategoryIcon kind="backup" size={18} color={colors.textSecondary} />
        <Text style={styles.backupButtonText}>Backup</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  backupButtonText: {
    ...typography.bodyEmphasis,
    color: colors.textSecondary,
  },
  searchButtonText: {
    ...typography.bodyEmphasis,
    color: colors.accent,
  },
});
