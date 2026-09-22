import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { colors, spacing } from '@shared/theme';

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
];

export function HomeScreen({ navigation }: Props) {
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
    color: colors.textPrimary,
    fontSize: 16,
  },
});
