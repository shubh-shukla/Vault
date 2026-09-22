import { useCallback, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import { useVaultKey } from '@app/VaultKeyContext';
import {
  deleteImportantNumber,
  listImportantNumbers,
  saveImportantNumber,
} from './importantNumberRepository';
import type { ImportantNumberEntry, ImportantNumberEntryInput } from './types';

export interface UseImportantNumbersResult {
  entries: ImportantNumberEntry[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: ImportantNumberEntryInput) => Promise<ImportantNumberEntry>;
  update: (entry: ImportantNumberEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useImportantNumbers(): UseImportantNumbersResult {
  const vaultKey = useVaultKey();
  const [entries, setEntries] = useState<ImportantNumberEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listImportantNumbers(vaultKey);
    setEntries(list);
    setIsLoading(false);
  }, [vaultKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: ImportantNumberEntryInput) => {
      const entry: ImportantNumberEntry = { id: uuid.v4() as string, ...input };
      await saveImportantNumber(vaultKey, entry);
      setEntries(previous => [...previous, entry]);
      return entry;
    },
    [vaultKey],
  );

  const update = useCallback(
    async (entry: ImportantNumberEntry) => {
      await saveImportantNumber(vaultKey, entry);
      setEntries(previous =>
        previous.map(existing => (existing.id === entry.id ? entry : existing)),
      );
    },
    [vaultKey],
  );

  const remove = useCallback(async (id: string) => {
    await deleteImportantNumber(id);
    setEntries(previous => previous.filter(existing => existing.id !== id));
  }, []);

  return { entries, isLoading, refresh, create, update, remove };
}
