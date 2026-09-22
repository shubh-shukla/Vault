import { useCallback, useEffect, useState } from 'react';
import { useVaultKey } from '@app/VaultKeyContext';
import { assignTag, listTagsForEntry, unassignTag } from './tagRepository';
import type { Tag } from './types';

export interface UseEntryTagsResult {
  tags: Tag[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  assign: (tagId: string) => Promise<void>;
  unassign: (tagId: string) => Promise<void>;
}

export function useEntryTags(
  entryType: string,
  entryId: string,
): UseEntryTagsResult {
  const vaultKey = useVaultKey();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listTagsForEntry(vaultKey, entryType, entryId);
    setTags(list);
    setIsLoading(false);
  }, [vaultKey, entryType, entryId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const assign = useCallback(
    async (tagId: string) => {
      await assignTag(vaultKey, tagId, entryType, entryId);
      await refresh();
    },
    [vaultKey, entryType, entryId, refresh],
  );

  const unassign = useCallback(
    async (tagId: string) => {
      await unassignTag(tagId, entryType, entryId);
      setTags(previous => previous.filter(tag => tag.id !== tagId));
    },
    [entryType, entryId],
  );

  return { tags, isLoading, refresh, assign, unassign };
}
