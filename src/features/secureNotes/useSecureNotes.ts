import { useCallback, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import { useVaultKey } from '@app/VaultKeyContext';
import {
  deleteSecureNote,
  listSecureNotes,
  saveSecureNote,
} from './secureNoteRepository';
import type { SecureNoteEntry, SecureNoteEntryInput } from './types';

export interface UseSecureNotesResult {
  entries: SecureNoteEntry[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: SecureNoteEntryInput) => Promise<SecureNoteEntry>;
  update: (entry: SecureNoteEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useSecureNotes(): UseSecureNotesResult {
  const vaultKey = useVaultKey();
  const [entries, setEntries] = useState<SecureNoteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listSecureNotes(vaultKey);
    setEntries(list);
    setIsLoading(false);
  }, [vaultKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: SecureNoteEntryInput) => {
      const entry: SecureNoteEntry = { id: uuid.v4() as string, ...input };
      await saveSecureNote(vaultKey, entry);
      setEntries(previous => [...previous, entry]);
      return entry;
    },
    [vaultKey],
  );

  const update = useCallback(
    async (entry: SecureNoteEntry) => {
      await saveSecureNote(vaultKey, entry);
      setEntries(previous =>
        previous.map(existing => (existing.id === entry.id ? entry : existing)),
      );
    },
    [vaultKey],
  );

  const remove = useCallback(async (id: string) => {
    await deleteSecureNote(id);
    setEntries(previous => previous.filter(existing => existing.id !== id));
  }, []);

  return { entries, isLoading, refresh, create, update, remove };
}
