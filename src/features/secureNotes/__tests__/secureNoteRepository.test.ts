import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listSecureNotes,
  saveSecureNote,
  deleteSecureNote,
} from '../secureNoteRepository';
import type { SecureNoteEntry } from '../types';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('secureNoteRepository', () => {
  it('round-trips an entry through save and list', async () => {
    const entry: SecureNoteEntry = {
      id: 'id-1',
      title: 'Safe combination',
      body: '12-34-56, turn dial left first',
    };

    await saveSecureNote(vaultKey, entry);

    expect(await listSecureNotes(vaultKey)).toEqual([entry]);
  });

  it('never persists plaintext title or body to disk', async () => {
    const entry: SecureNoteEntry = {
      id: 'id-1',
      title: 'Safe combination',
      body: '12-34-56, turn dial left first',
    };

    await saveSecureNote(vaultKey, entry);

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('Safe combination');
      expect(raw).not.toContain('12-34-56');
    }
  });

  it('cannot be decrypted with a different vault key', async () => {
    const entry: SecureNoteEntry = { id: 'id-1', title: 'Note', body: 'body' };
    await saveSecureNote(vaultKey, entry);

    const wrongKey = Buffer.alloc(32, 7);
    await expect(listSecureNotes(wrongKey)).rejects.toThrow();
  });

  it('deletes an entry', async () => {
    const entry: SecureNoteEntry = { id: 'id-1', title: 'Note', body: 'body' };
    await saveSecureNote(vaultKey, entry);
    await deleteSecureNote('id-1');

    expect(await listSecureNotes(vaultKey)).toEqual([]);
  });
});
