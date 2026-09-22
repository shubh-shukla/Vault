import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '@shared/theme';
import { useTags } from './useTags';
import { useEntryTags } from './useEntryTags';
import type { Tag } from './types';

export interface TagsSectionProps {
  entryType: string;
  entryId: string;
}

export function TagsSection({ entryType, entryId }: TagsSectionProps) {
  const { tags: allTags, create: createTag } = useTags();
  const {
    tags: assignedTags,
    assign,
    unassign,
  } = useEntryTags(entryType, entryId);
  const [draftName, setDraftName] = useState('');

  const assignedTagIds = new Set(assignedTags.map(tag => tag.id));
  const availableTags = allTags.filter(tag => !assignedTagIds.has(tag.id));

  const handleAddTag = useCallback(async () => {
    const name = draftName.trim();
    if (name.length === 0) {
      return;
    }

    const existing = allTags.find(
      tag => tag.name.toLowerCase() === name.toLowerCase(),
    );
    const tag: Tag = existing ?? (await createTag(name));
    await assign(tag.id);
    setDraftName('');
  }, [draftName, allTags, createTag, assign]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tags</Text>

      <View style={styles.chipRow}>
        {assignedTags.map(tag => (
          <Pressable
            key={tag.id}
            accessibilityRole="button"
            style={styles.assignedChip}
            onPress={() => unassign(tag.id)}
          >
            <Text style={styles.assignedChipText}>{tag.name} ×</Text>
          </Pressable>
        ))}
      </View>

      {availableTags.length > 0 && (
        <View style={styles.chipRow}>
          {availableTags.map(tag => (
            <Pressable
              key={tag.id}
              accessibilityRole="button"
              style={styles.availableChip}
              onPress={() => assign(tag.id)}
            >
              <Text style={styles.availableChipText}>{tag.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={draftName}
          onChangeText={setDraftName}
          placeholder="New tag"
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={handleAddTag}
        />
        <Pressable
          accessibilityRole="button"
          onPress={handleAddTag}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  assignedChip: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  assignedChipText: {
    ...typography.label,
    color: colors.accentText,
    fontWeight: '600',
  },
  availableChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  availableChipText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  addButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    ...typography.label,
    color: colors.accent,
    fontWeight: '600',
  },
});
