import { useCallback, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import { useVaultKey } from '@app/VaultKeyContext';
import {
  deleteDeviceDetail,
  listDeviceDetails,
  saveDeviceDetail,
} from './deviceDetailRepository';
import type { DeviceDetailEntry, DeviceDetailEntryInput } from './types';

export interface UseDeviceDetailsResult {
  entries: DeviceDetailEntry[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: DeviceDetailEntryInput) => Promise<DeviceDetailEntry>;
  update: (entry: DeviceDetailEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useDeviceDetails(): UseDeviceDetailsResult {
  const vaultKey = useVaultKey();
  const [entries, setEntries] = useState<DeviceDetailEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listDeviceDetails(vaultKey);
    setEntries(list);
    setIsLoading(false);
  }, [vaultKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: DeviceDetailEntryInput) => {
      const entry: DeviceDetailEntry = { id: uuid.v4() as string, ...input };
      await saveDeviceDetail(vaultKey, entry);
      setEntries(previous => [...previous, entry]);
      return entry;
    },
    [vaultKey],
  );

  const update = useCallback(
    async (entry: DeviceDetailEntry) => {
      await saveDeviceDetail(vaultKey, entry);
      setEntries(previous =>
        previous.map(existing => (existing.id === entry.id ? entry : existing)),
      );
    },
    [vaultKey],
  );

  const remove = useCallback(async (id: string) => {
    await deleteDeviceDetail(id);
    setEntries(previous => previous.filter(existing => existing.id !== id));
  }, []);

  return { entries, isLoading, refresh, create, update, remove };
}
