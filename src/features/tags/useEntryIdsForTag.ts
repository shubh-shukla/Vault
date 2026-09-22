import { useEffect, useState } from 'react';
import { useVaultKey } from '@app/VaultKeyContext';
import { listEntryRefsForTag } from './tagRepository';

export function useEntryIdsForTag(
  entryType: string,
  tagId: string | null,
): Set<string> {
  const vaultKey = useVaultKey();
  const [entryIds, setEntryIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (tagId === null) {
      setEntryIds(new Set());
      return;
    }

    let cancelled = false;
    listEntryRefsForTag(vaultKey, tagId).then(refs => {
      if (!cancelled) {
        setEntryIds(
          new Set(
            refs
              .filter(ref => ref.entryType === entryType)
              .map(ref => ref.entryId),
          ),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [vaultKey, entryType, tagId]);

  return entryIds;
}
