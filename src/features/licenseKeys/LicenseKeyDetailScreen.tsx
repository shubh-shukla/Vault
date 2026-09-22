import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/types';
import { FieldRow } from '@shared/components/FieldRow';
import { RevealableSecretField } from '@shared/components/RevealableSecretField';
import { colors, radius, spacing, typography } from '@shared/theme';
import { useLicenseKeys } from './useLicenseKeys';

type Props = NativeStackScreenProps<RootStackParamList, 'LicenseKeyDetail'>;

export function LicenseKeyDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { licenseKeys, create, update, remove } = useLicenseKeys();
  const existing = id
    ? licenseKeys.find(licenseKey => licenseKey.id === id)
    : undefined;

  const [isEditing, setIsEditing] = useState(id === undefined);
  const [productName, setProductName] = useState('');
  const [key, setKey] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  const handleEdit = () => {
    if (existing) {
      setProductName(existing.productName);
      setKey(existing.key);
      setPurchaseNotes(existing.purchaseNotes);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (existing) {
      await update({ ...existing, productName, key, purchaseNotes });
    } else {
      await create({ productName, key, purchaseNotes });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) {
      return;
    }
    Alert.alert('Delete this license key?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (isEditing) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.fieldLabel}>Product name</Text>
        <TextInput
          style={styles.input}
          value={productName}
          onChangeText={setProductName}
          placeholder="Product name"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.fieldLabel}>License key</Text>
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={setKey}
          placeholder="License key"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>Purchase notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={purchaseNotes}
          onChangeText={setPurchaseNotes}
          placeholder="Purchase notes"
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
      <FieldRow label="Product name" value={existing.productName} />

      <RevealableSecretField label="License key" value={existing.key} />

      <FieldRow label="Purchase notes" value={existing.purchaseNotes} />

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
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.bodyEmphasis,
    color: colors.accentText,
  },
  deleteButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    ...typography.bodyEmphasis,
    color: colors.danger,
  },
});
