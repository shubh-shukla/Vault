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
import { colors, radius, spacing, typography } from '@shared/theme';
import { AttachmentsSection } from '@features/attachments';
import { TagsSection } from '@features/tags';
import { useSecureNotes } from './useSecureNotes';

const ENTRY_TYPE = 'secureNotes';

type Props = NativeStackScreenProps<RootStackParamList, 'SecureNoteDetail'>;

export function SecureNoteDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { entries, create, update, remove } = useSecureNotes();
  const existing = id ? entries.find(entry => entry.id === id) : undefined;

  const [isEditing, setIsEditing] = useState(id === undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleEdit = () => {
    if (existing) {
      setTitle(existing.title);
      setBody(existing.body);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (existing) {
      await update({ ...existing, title, body });
    } else {
      await create({ title, body });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing) {
      return;
    }
    Alert.alert('Delete this note?', 'This cannot be undone.', [
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
        <Text style={styles.fieldLabel}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.fieldLabel}>Note</Text>
        <TextInput
          style={[styles.input, styles.bodyInput]}
          value={body}
          onChangeText={setBody}
          placeholder="Note"
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
      <Text style={styles.viewTitle}>{existing.title || 'Untitled note'}</Text>
      <Text style={styles.viewBody}>{existing.body}</Text>

      <TagsSection entryType={ENTRY_TYPE} entryId={existing.id} />

      <AttachmentsSection entryType={ENTRY_TYPE} entryId={existing.id} />

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
  viewTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  viewBody: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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
  bodyInput: {
    minHeight: 160,
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
