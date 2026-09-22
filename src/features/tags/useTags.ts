import { useCallback, useEffect, useState } from 'react';
import { useVaultKey } from '@app/VaultKeyContext';
import { createTag, deleteTag, listTags, renameTag } from './tagRepository';
import type { Tag } from './types';

export interface UseTagsResult {
  tags: Tag[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (name: string) => Promise<Tag>;
  rename: (tag: Tag) => Promise<void>;
  remove: (tagId: string) => Promise<void>;
}

export function useTags(): UseTagsResult {
  const vaultKey = useVaultKey();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listTags(vaultKey);
    setTags(list);
    setIsLoading(false);
  }, [vaultKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (name: string) => {
      const tag = await createTag(vaultKey, name);
      setTags(previous => [...previous, tag]);
      return tag;
    },
    [vaultKey],
  );

  const rename = useCallback(
    async (tag: Tag) => {
      await renameTag(vaultKey, tag);
      setTags(previous =>
        previous.map(existing => (existing.id === tag.id ? tag : existing)),
      );
    },
    [vaultKey],
  );

  const remove = useCallback(
    async (tagId: string) => {
      await deleteTag(vaultKey, tagId);
      setTags(previous => previous.filter(existing => existing.id !== tagId));
    },
    [vaultKey],
  );

  return { tags, isLoading, refresh, create, rename, remove };
}
