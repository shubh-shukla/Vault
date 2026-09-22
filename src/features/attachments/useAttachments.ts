import { useCallback, useEffect, useState } from 'react';
import { useVaultKey } from '@app/VaultKeyContext';
import {
  addAttachment,
  listAttachmentsForEntry,
  removeAttachment,
} from './attachmentRepository';
import type { AttachmentMetadata } from './types';

export interface UseAttachmentsResult {
  attachments: AttachmentMetadata[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  add: (params: {
    fileName: string;
    mimeType: string;
    data: Buffer;
  }) => Promise<AttachmentMetadata>;
  remove: (metadata: AttachmentMetadata) => Promise<void>;
}

export function useAttachments(
  entryType: string,
  entryId: string,
): UseAttachmentsResult {
  const vaultKey = useVaultKey();
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listAttachmentsForEntry(vaultKey, entryType, entryId);
    setAttachments(list);
    setIsLoading(false);
  }, [vaultKey, entryType, entryId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (params: { fileName: string; mimeType: string; data: Buffer }) => {
      const metadata = await addAttachment(vaultKey, {
        entryType,
        entryId,
        ...params,
      });
      setAttachments(previous => [...previous, metadata]);
      return metadata;
    },
    [vaultKey, entryType, entryId],
  );

  const remove = useCallback(async (metadata: AttachmentMetadata) => {
    await removeAttachment(metadata);
    setAttachments(previous =>
      previous.filter(existing => existing.id !== metadata.id),
    );
  }, []);

  return { attachments, isLoading, refresh, add, remove };
}
