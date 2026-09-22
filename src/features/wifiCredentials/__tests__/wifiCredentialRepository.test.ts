import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listWifiCredentials,
  saveWifiCredential,
  deleteWifiCredential,
} from '../wifiCredentialRepository';
import type { WifiCredential } from '../types';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('wifiCredentialRepository', () => {
  it('round-trips a credential through save and list', async () => {
    const credential: WifiCredential = {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'correct-horse-battery-staple',
      notes: 'Guest room router',
    };

    await saveWifiCredential(vaultKey, credential);

    expect(await listWifiCredentials(vaultKey)).toEqual([credential]);
  });

  it('never persists plaintext SSID, password, or notes to disk', async () => {
    const credential: WifiCredential = {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'correct-horse-battery-staple',
      notes: 'Guest room router',
    };

    await saveWifiCredential(vaultKey, credential);

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('HomeWifi');
      expect(raw).not.toContain('correct-horse-battery-staple');
      expect(raw).not.toContain('Guest room router');
    }
  });

  it('cannot be decrypted with a different vault key', async () => {
    const credential: WifiCredential = {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'correct-horse-battery-staple',
      notes: '',
    };
    await saveWifiCredential(vaultKey, credential);

    const wrongKey = Buffer.alloc(32, 7);
    await expect(listWifiCredentials(wrongKey)).rejects.toThrow();
  });

  it('deletes a credential', async () => {
    const credential: WifiCredential = {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    };
    await saveWifiCredential(vaultKey, credential);
    await deleteWifiCredential('id-1');

    expect(await listWifiCredentials(vaultKey)).toEqual([]);
  });
});
