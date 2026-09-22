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
import { colors, radius, spacing, typography } from '@shared/theme';
import { useDeviceDetails } from './useDeviceDetails';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetailDetail'>;

export function DeviceDetailDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { entries, create, update, remove } = useDeviceDetails();
  const existing = id ? entries.find(entry => entry.id === id) : undefined;

  const [isEditing, setIsEditing] = useState(id === undefined);
  const [deviceName, setDeviceName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [specs, setSpecs] = useState('');
  const [notes, setNotes] = useState('');

  const handleEdit = () => {
    if (existing) {
      setDeviceName(existing.deviceName);
      setSerialNumber(existing.serialNumber);
      setSpecs(existing.specs);
      setNotes(existing.notes);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (existing) {
      await update({ ...existing, deviceName, serialNumber, specs, notes });
    } else {
      await create({ deviceName, serialNumber, specs, notes });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) {
      return;
    }
    Alert.alert('Delete this device?', 'This cannot be undone.', [
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
        <Text style={styles.fieldLabel}>Device name</Text>
        <TextInput
          style={styles.input}
          value={deviceName}
          onChangeText={setDeviceName}
          placeholder="Device name"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.fieldLabel}>Serial number</Text>
        <TextInput
          style={styles.input}
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="Serial number"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>Specs</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={specs}
          onChangeText={setSpecs}
          placeholder="Specs"
          placeholderTextColor={colors.textSecondary}
          multiline
        />

        <Text style={styles.fieldLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
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
      <FieldRow label="Device name" value={existing.deviceName} />
      <FieldRow label="Serial number" value={existing.serialNumber} />
      <FieldRow label="Specs" value={existing.specs} />
      <FieldRow label="Notes" value={existing.notes} />

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
  multilineInput: {
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
