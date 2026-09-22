import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listRecoveryCodeEntries,
  saveRecoveryCodeEntry,
  deleteRecoveryCodeEntry,
} from '../recoveryCodeRepository';
import type { RecoveryCodeEntry } from '../types';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('recoveryCodeRepository', () => {
  it('round-trips an entry with multiple codes', async () => {
    const entry: RecoveryCodeEntry = {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['aaaa-1111', 'bbbb-2222', 'cccc-3333'],
      notes: 'Printed and stored in a safe',
    };

    await saveRecoveryCodeEntry(vaultKey, entry);

    expect(await listRecoveryCodeEntries(vaultKey)).toEqual([entry]);
  });

  it('never persists plaintext service name, codes, or notes to disk', async () => {
    const entry: RecoveryCodeEntry = {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['aaaa-1111', 'bbbb-2222'],
      notes: 'Printed and stored in a safe',
    };

    await saveRecoveryCodeEntry(vaultKey, entry);

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('GitHub');
      expect(raw).not.toContain('aaaa-1111');
      expect(raw).not.toContain('Printed and stored in a safe');
    }
  });

  it('cannot be decrypted with a different vault key', async () => {
    const entry: RecoveryCodeEntry = {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['aaaa-1111'],
      notes: '',
    };
    await saveRecoveryCodeEntry(vaultKey, entry);

    const wrongKey = Buffer.alloc(32, 7);
    await expect(listRecoveryCodeEntries(wrongKey)).rejects.toThrow();
  });

  it('deletes an entry', async () => {
    const entry: RecoveryCodeEntry = {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['aaaa-1111'],
      notes: '',
    };
    await saveRecoveryCodeEntry(vaultKey, entry);
    await deleteRecoveryCodeEntry('id-1');

    expect(await listRecoveryCodeEntries(vaultKey)).toEqual([]);
  });
});
