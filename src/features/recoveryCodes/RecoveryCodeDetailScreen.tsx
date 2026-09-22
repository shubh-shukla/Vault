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
import { useRecoveryCodes } from './useRecoveryCodes';

type Props = NativeStackScreenProps<RootStackParamList, 'RecoveryCodeDetail'>;

function codesToText(codes: string[]): string {
  return codes.join('\n');
}

function textToCodes(text: string): string[] {
  return text
    .split('\n')
    .map(code => code.trim())
    .filter(code => code.length > 0);
}

export function RecoveryCodeDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { entries, create, update, remove } = useRecoveryCodes();
  const existing = id ? entries.find(entry => entry.id === id) : undefined;

  const [isEditing, setIsEditing] = useState(id === undefined);
  const [serviceName, setServiceName] = useState('');
  const [codesText, setCodesText] = useState('');
  const [notes, setNotes] = useState('');

  const handleEdit = () => {
    if (existing) {
      setServiceName(existing.serviceName);
      setCodesText(codesToText(existing.codes));
      setNotes(existing.notes);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    const codes = textToCodes(codesText);
    if (existing) {
      await update({ ...existing, serviceName, codes, notes });
    } else {
      await create({ serviceName, codes, notes });
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
        <Text style={styles.fieldLabel}>Service name</Text>
        <TextInput
          style={styles.input}
          value={serviceName}
          onChangeText={setServiceName}
          placeholder="Service name"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.fieldLabel}>Recovery codes (one per line)</Text>
        <TextInput
          style={[styles.input, styles.codesInput]}
          value={codesText}
          onChangeText={setCodesText}
          placeholder="Recovery codes"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          multiline
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
      <Text style={styles.fieldLabel}>Service name</Text>
      <Text style={styles.viewValue}>{existing.serviceName}</Text>

      <RevealableSecretField
        label={`Recovery codes (${existing.codes.length})`}
        value={codesToText(existing.codes)}
      />

      <Text style={styles.fieldLabel}>Notes</Text>
      <Text style={styles.viewValue}>{existing.notes || '—'}</Text>

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
  codesInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'Menlo',
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
