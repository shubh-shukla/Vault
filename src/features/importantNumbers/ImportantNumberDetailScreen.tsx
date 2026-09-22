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
import { useImportantNumbers } from './useImportantNumbers';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ImportantNumberDetail'
>;

export function ImportantNumberDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { entries, create, update, remove } = useImportantNumbers();
  const existing = id ? entries.find(entry => entry.id === id) : undefined;

  const [isEditing, setIsEditing] = useState(id === undefined);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');

  const handleEdit = () => {
    if (existing) {
      setLabel(existing.label);
      setValue(existing.value);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (existing) {
      await update({ ...existing, label, value });
    } else {
      await create({ label, value });
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
        <Text style={styles.fieldLabel}>Label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Label"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.fieldLabel}>Value</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="Value"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
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
      <Text style={styles.fieldLabel}>Label</Text>
      <Text style={styles.viewValue}>{existing.label}</Text>

      <RevealableSecretField label="Value" value={existing.value} />

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
