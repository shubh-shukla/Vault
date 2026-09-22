import { useCallback, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import { useVaultKey } from '@app/VaultKeyContext';
import {
  deleteLicenseKey,
  listLicenseKeys,
  saveLicenseKey,
} from './licenseKeyRepository';
import type { LicenseKey, LicenseKeyInput } from './types';

export interface UseLicenseKeysResult {
  licenseKeys: LicenseKey[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (input: LicenseKeyInput) => Promise<LicenseKey>;
  update: (licenseKey: LicenseKey) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useLicenseKeys(): UseLicenseKeysResult {
  const vaultKey = useVaultKey();
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const list = await listLicenseKeys(vaultKey);
    setLicenseKeys(list);
    setIsLoading(false);
  }, [vaultKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: LicenseKeyInput) => {
      const licenseKey: LicenseKey = { id: uuid.v4() as string, ...input };
      await saveLicenseKey(vaultKey, licenseKey);
      setLicenseKeys(previous => [...previous, licenseKey]);
      return licenseKey;
    },
    [vaultKey],
  );

  const update = useCallback(
    async (licenseKey: LicenseKey) => {
      await saveLicenseKey(vaultKey, licenseKey);
      setLicenseKeys(previous =>
        previous.map(existing =>
          existing.id === licenseKey.id ? licenseKey : existing,
        ),
      );
    },
    [vaultKey],
  );

  const remove = useCallback(async (id: string) => {
    await deleteLicenseKey(id);
    setLicenseKeys(previous => previous.filter(existing => existing.id !== id));
  }, []);

  return { licenseKeys, isLoading, refresh, create, update, remove };
}
