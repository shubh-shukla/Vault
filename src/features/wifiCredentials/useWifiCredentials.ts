import { useCallback, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import { useVaultKey } from '@app/VaultKeyContext';
import {
  deleteWifiCredential,
  listWifiCredentials,
  saveWifiCredential,
} from './wifiCredentialRepository';
import type { WifiCredential, WifiCredentialInput } from './types';

export interface UseWifiCredentialsResult {
  credentials: WifiCredential[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: WifiCredentialInput) => Promise<WifiCredential>;
  update: (credential: WifiCredential) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useWifiCredentials(): UseWifiCredentialsResult {
  const vaultKey = useVaultKey();
  const [credentials, setCredentials] = useState<WifiCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listWifiCredentials(vaultKey);
    setCredentials(list);
    setIsLoading(false);
  }, [vaultKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: WifiCredentialInput) => {
      const credential: WifiCredential = { id: uuid.v4() as string, ...input };
      await saveWifiCredential(vaultKey, credential);
      setCredentials(previous => [...previous, credential]);
      return credential;
    },
    [vaultKey],
  );

  const update = useCallback(
    async (credential: WifiCredential) => {
      await saveWifiCredential(vaultKey, credential);
      setCredentials(previous =>
        previous.map(existing =>
          existing.id === credential.id ? credential : existing,
        ),
      );
    },
    [vaultKey],
  );

  const remove = useCallback(async (id: string) => {
    await deleteWifiCredential(id);
    setCredentials(previous => previous.filter(existing => existing.id !== id));
  }, []);

  return { credentials, isLoading, refresh, create, update, remove };
}
