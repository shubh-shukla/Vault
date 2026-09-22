import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { RevealableSecretField } from '@shared/components/RevealableSecretField';
import { colors, spacing } from '@shared/theme';
import { TagsSection } from '@features/tags';
import { useWifiCredentials } from './useWifiCredentials';

const ENTRY_TYPE = 'wifiCredentials';

type Props = NativeStackScreenProps<RootStackParamList, 'WifiCredentialDetail'>;

export function WifiCredentialDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { credentials, create, update, remove } = useWifiCredentials();
  const existing = id
    ? credentials.find(credential => credential.id === id)
    : undefined;

  // Whether we start in edit mode depends only on whether an id was passed
  // in — not on `existing`, which is still undefined on the first render
  // while the credential list is loading.
  const [isEditing, setIsEditing] = useState(id === undefined);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  const handleEdit = () => {
    if (existing) {
      setSsid(existing.ssid);
      setPassword(existing.password);
      setNotes(existing.notes);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (existing) {
      await update({ ...existing, ssid, password, notes });
    } else {
      await create({ ssid, password, notes });
    }
    navigation.goBack();
  };

  const handleDelete = async () => {
    if (!existing) {
      return;
    }
    await remove(existing.id);
    navigation.goBack();
  };

  if (isEditing) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.fieldLabel}>Network name (SSID)</Text>
        <TextInput
          style={styles.input}
          value={ssid}
          onChangeText={setSsid}
          placeholder="Home Wi-Fi"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes"
          placeholderTextColor={colors.textSecondary}
          multiline
        />

        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={handleSave}
        >
          <Text style={styles.primaryButtonText}>Save</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (!existing) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.fieldLabel}>Network name (SSID)</Text>
      <Text style={styles.viewValue}>{existing.ssid}</Text>

      <RevealableSecretField label="Password" value={existing.password} />

      <Text style={styles.fieldLabel}>Notes</Text>
      <Text style={styles.viewValue}>{existing.notes || '—'}</Text>

      <TagsSection entryType={ENTRY_TYPE} entryId={existing.id} />

      <Pressable
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={handleEdit}
      >
        <Text style={styles.primaryButtonText}>Edit</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  viewValue: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
