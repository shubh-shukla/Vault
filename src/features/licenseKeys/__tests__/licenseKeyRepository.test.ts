import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listLicenseKeys,
  saveLicenseKey,
  deleteLicenseKey,
} from '../licenseKeyRepository';
import type { LicenseKey } from '../types';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('licenseKeyRepository', () => {
  it('round-trips a license key through save and list', async () => {
    const licenseKey: LicenseKey = {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'XXXX-YYYY-ZZZZ-1111',
      purchaseNotes: 'Bought on the App Store, 2024-01-01',
    };

    await saveLicenseKey(vaultKey, licenseKey);

    expect(await listLicenseKeys(vaultKey)).toEqual([licenseKey]);
  });

  it('never persists plaintext product name, key, or notes to disk', async () => {
    const licenseKey: LicenseKey = {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'XXXX-YYYY-ZZZZ-1111',
      purchaseNotes: 'Bought on the App Store',
    };

    await saveLicenseKey(vaultKey, licenseKey);

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('Photo Editor Pro');
      expect(raw).not.toContain('XXXX-YYYY-ZZZZ-1111');
      expect(raw).not.toContain('Bought on the App Store');
    }
  });

  it('cannot be decrypted with a different vault key', async () => {
    const licenseKey: LicenseKey = {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'XXXX-YYYY-ZZZZ-1111',
      purchaseNotes: '',
    };
    await saveLicenseKey(vaultKey, licenseKey);

    const wrongKey = Buffer.alloc(32, 7);
    await expect(listLicenseKeys(wrongKey)).rejects.toThrow();
  });

  it('deletes a license key', async () => {
    const licenseKey: LicenseKey = {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'key',
      purchaseNotes: '',
    };
    await saveLicenseKey(vaultKey, licenseKey);
    await deleteLicenseKey('id-1');

    expect(await listLicenseKeys(vaultKey)).toEqual([]);
  });
});
