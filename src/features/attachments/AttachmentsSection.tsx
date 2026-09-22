import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { keepLocalCopy, pick } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { colors, spacing, typography } from '@shared/theme';
import { useAttachments } from './useAttachments';
import type { AttachmentMetadata } from './types';

export interface AttachmentsSectionProps {
  entryType: string;
  entryId: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

export function AttachmentsSection({
  entryType,
  entryId,
}: AttachmentsSectionProps) {
  const { attachments, add, remove } = useAttachments(entryType, entryId);
  const [isImporting, setIsImporting] = useState(false);

  const handleAdd = useCallback(async () => {
    setIsImporting(true);
    try {
      const [picked] = await pick({ mode: 'import' });
      const [copy] = await keepLocalCopy({
        files: [{ uri: picked.uri, fileName: picked.name ?? 'attachment' }],
        destination: 'cachesDirectory',
      });

      if (copy.status !== 'success') {
        return;
      }

      const localPath = copy.localUri.replace('file://', '');
      const base64 = await RNFS.readFile(localPath, 'base64');
      await add({
        fileName: picked.name ?? 'attachment',
        mimeType: picked.type ?? 'application/octet-stream',
        data: Buffer.from(base64, 'base64'),
      });
      await RNFS.unlink(localPath);
    } finally {
      setIsImporting(false);
    }
  }, [add]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Attachments</Text>
      {attachments.map((attachment: AttachmentMetadata) => (
        <View key={attachment.id} style={styles.row}>
          <Text style={styles.fileName}>{attachment.fileName}</Text>
          <Text style={styles.fileSize}>
            {formatSize(attachment.sizeBytes)}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => remove(attachment)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={handleAdd}
        style={styles.addButton}
        disabled={isImporting}
      >
        <Text style={styles.addButtonText}>
          {isImporting ? 'Importing…' : 'Add attachment'}
        </Text>
      </Pressable>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  fileName: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  fileSize: {
    ...typography.label,
    color: colors.textSecondary,
  },
  removeButton: {
    paddingHorizontal: spacing.sm,
  },
  removeButtonText: {
    ...typography.label,
    color: colors.danger,
    fontWeight: '600',
  },
  addButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    ...typography.bodyEmphasis,
    color: colors.accent,
  },
});
