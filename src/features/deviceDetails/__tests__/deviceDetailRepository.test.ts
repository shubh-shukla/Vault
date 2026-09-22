import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listDeviceDetails,
  saveDeviceDetail,
  deleteDeviceDetail,
} from '../deviceDetailRepository';
import type { DeviceDetailEntry } from '../types';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('deviceDetailRepository', () => {
  it('round-trips an entry through save and list', async () => {
    const entry: DeviceDetailEntry = {
      id: 'id-1',
      deviceName: "Shubham's MacBook Pro",
      serialNumber: 'C02ABCD1234',
      specs: 'M3 Max, 64GB RAM, 2TB SSD',
      notes: 'Work laptop',
    };

    await saveDeviceDetail(vaultKey, entry);

    expect(await listDeviceDetails(vaultKey)).toEqual([entry]);
  });

  it('never persists plaintext device name, serial number, or specs to disk', async () => {
    const entry: DeviceDetailEntry = {
      id: 'id-1',
      deviceName: "Shubham's MacBook Pro",
      serialNumber: 'C02ABCD1234',
      specs: 'M3 Max, 64GB RAM',
      notes: '',
    };

    await saveDeviceDetail(vaultKey, entry);

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('MacBook');
      expect(raw).not.toContain('C02ABCD1234');
      expect(raw).not.toContain('M3 Max');
    }
  });

  it('cannot be decrypted with a different vault key', async () => {
    const entry: DeviceDetailEntry = {
      id: 'id-1',
      deviceName: 'Device',
      serialNumber: 'SN',
      specs: '',
      notes: '',
    };
    await saveDeviceDetail(vaultKey, entry);

    const wrongKey = Buffer.alloc(32, 7);
    await expect(listDeviceDetails(wrongKey)).rejects.toThrow();
  });

  it('deletes an entry', async () => {
    const entry: DeviceDetailEntry = {
      id: 'id-1',
      deviceName: 'Device',
      serialNumber: 'SN',
      specs: '',
      notes: '',
    };
    await saveDeviceDetail(vaultKey, entry);
    await deleteDeviceDetail('id-1');

    expect(await listDeviceDetails(vaultKey)).toEqual([]);
  });
});
