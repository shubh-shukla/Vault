import { useCallback, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import { useVaultKey } from '@app/VaultKeyContext';
import {
  deleteRecoveryCodeEntry,
  listRecoveryCodeEntries,
  saveRecoveryCodeEntry,
} from './recoveryCodeRepository';
import type { RecoveryCodeEntry, RecoveryCodeEntryInput } from './types';

export interface UseRecoveryCodesResult {
  entries: RecoveryCodeEntry[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: RecoveryCodeEntryInput) => Promise<RecoveryCodeEntry>;
  update: (entry: RecoveryCodeEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useRecoveryCodes(): UseRecoveryCodesResult {
  const vaultKey = useVaultKey();
  const [entries, setEntries] = useState<RecoveryCodeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listRecoveryCodeEntries(vaultKey);
    setEntries(list);
    setIsLoading(false);
  }, [vaultKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: RecoveryCodeEntryInput) => {
      const entry: RecoveryCodeEntry = { id: uuid.v4() as string, ...input };
      await saveRecoveryCodeEntry(vaultKey, entry);
      setEntries(previous => [...previous, entry]);
      return entry;
    },
    [vaultKey],
  );

  const update = useCallback(
    async (entry: RecoveryCodeEntry) => {
      await saveRecoveryCodeEntry(vaultKey, entry);
      setEntries(previous =>
        previous.map(existing => (existing.id === entry.id ? entry : existing)),
      );
    },
    [vaultKey],
  );

  const remove = useCallback(async (id: string) => {
    await deleteRecoveryCodeEntry(id);
    setEntries(previous => previous.filter(existing => existing.id !== id));
  }, []);

  return { entries, isLoading, refresh, create, update, remove };
}
