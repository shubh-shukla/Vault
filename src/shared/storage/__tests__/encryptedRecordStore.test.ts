import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  listRecordIds,
  saveEncryptedRecord,
  loadEncryptedRecord,
  loadAllEncryptedRecords,
  deleteEncryptedRecord,
} from '../encryptedRecordStore';
import type { EncryptedEnvelope } from '@shared/crypto';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };

const envelope = (label: string): EncryptedEnvelope => ({
  iv: `iv-${label}`,
  ciphertext: `ciphertext-${label}`,
  authTag: `authTag-${label}`,
});

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('encryptedRecordStore', () => {
  it('starts with an empty collection', async () => {
    expect(await listRecordIds('wifiCredentials')).toEqual([]);
  });

  it('saves and loads a record by id', async () => {
    await saveEncryptedRecord('wifiCredentials', 'id-1', envelope('a'));

    expect(await loadEncryptedRecord('wifiCredentials', 'id-1')).toEqual(
      envelope('a'),
    );
  });

  it('returns null for a record that was never saved', async () => {
    expect(await loadEncryptedRecord('wifiCredentials', 'missing')).toBeNull();
  });

  it('tracks saved ids in the manifest without duplicating on re-save', async () => {
    await saveEncryptedRecord('wifiCredentials', 'id-1', envelope('a'));
    await saveEncryptedRecord('wifiCredentials', 'id-1', envelope('a-updated'));
    await saveEncryptedRecord('wifiCredentials', 'id-2', envelope('b'));

    expect(await listRecordIds('wifiCredentials')).toEqual(['id-1', 'id-2']);
    expect(await loadEncryptedRecord('wifiCredentials', 'id-1')).toEqual(
      envelope('a-updated'),
    );
  });

  it('loads every record in the collection', async () => {
    await saveEncryptedRecord('wifiCredentials', 'id-1', envelope('a'));
    await saveEncryptedRecord('wifiCredentials', 'id-2', envelope('b'));

    const all = await loadAllEncryptedRecords('wifiCredentials');
    expect(all).toEqual([
      { id: 'id-1', envelope: envelope('a') },
      { id: 'id-2', envelope: envelope('b') },
    ]);
  });

  it('deletes a record and removes it from the manifest', async () => {
    await saveEncryptedRecord('wifiCredentials', 'id-1', envelope('a'));
    await saveEncryptedRecord('wifiCredentials', 'id-2', envelope('b'));

    await deleteEncryptedRecord('wifiCredentials', 'id-1');

    expect(await listRecordIds('wifiCredentials')).toEqual(['id-2']);
    expect(await loadEncryptedRecord('wifiCredentials', 'id-1')).toBeNull();
  });

  it('keeps separate collections independent', async () => {
    await saveEncryptedRecord('wifiCredentials', 'id-1', envelope('wifi'));
    await saveEncryptedRecord('licenseKeys', 'id-1', envelope('license'));

    expect(await loadEncryptedRecord('wifiCredentials', 'id-1')).toEqual(
      envelope('wifi'),
    );
    expect(await loadEncryptedRecord('licenseKeys', 'id-1')).toEqual(
      envelope('license'),
    );
  });

  it('never stores anything except opaque ciphertext envelopes', async () => {
    await saveEncryptedRecord('wifiCredentials', 'id-1', envelope('a'));

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string);
      if (Array.isArray(parsed)) {
        continue; // the manifest — just a list of ids, not a value
      }
      expect(Object.keys(parsed).sort()).toEqual([
        'authTag',
        'ciphertext',
        'iv',
      ]);
    }
  });
});
