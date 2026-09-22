import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listImportantNumbers,
  saveImportantNumber,
  deleteImportantNumber,
} from '../importantNumberRepository';
import type { ImportantNumberEntry } from '../types';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('importantNumberRepository', () => {
  it('round-trips an entry through save and list', async () => {
    const entry: ImportantNumberEntry = {
      id: 'id-1',
      label: 'Passport number',
      value: 'X1234567',
    };

    await saveImportantNumber(vaultKey, entry);

    expect(await listImportantNumbers(vaultKey)).toEqual([entry]);
  });

  it('never persists plaintext label or value to disk', async () => {
    const entry: ImportantNumberEntry = {
      id: 'id-1',
      label: 'Passport number',
      value: 'X1234567',
    };

    await saveImportantNumber(vaultKey, entry);

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('Passport number');
      expect(raw).not.toContain('X1234567');
    }
  });

  it('cannot be decrypted with a different vault key', async () => {
    const entry: ImportantNumberEntry = {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    };
    await saveImportantNumber(vaultKey, entry);

    const wrongKey = Buffer.alloc(32, 7);
    await expect(listImportantNumbers(wrongKey)).rejects.toThrow();
  });

  it('deletes an entry', async () => {
    const entry: ImportantNumberEntry = {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    };
    await saveImportantNumber(vaultKey, entry);
    await deleteImportantNumber('id-1');

    expect(await listImportantNumbers(vaultKey)).toEqual([]);
  });
});
