import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {
  saveWifiCredential,
  listWifiCredentials,
} from '@features/wifiCredentials';
import { saveSecureNote, listSecureNotes } from '@features/secureNotes';
import { addAttachment, listAttachmentsForEntry } from '@features/attachments';
import {
  BackupDecryptionError,
  exportVaultBackup,
  importVaultBackup,
} from '../backupService';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const mockRNFS = RNFS as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
  mockRNFS.__reset();
});

describe('exportVaultBackup / importVaultBackup', () => {
  it('round-trips every entry type and attachments through export then import into a fresh vault', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    await saveSecureNote(vaultKey, {
      id: 'n1',
      title: 'My Note',
      body: 'body text',
    });
    await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'n1',
      fileName: 'receipt.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('pdf bytes'),
    });

    const exported = await exportVaultBackup(
      vaultKey,
      'correct horse battery staple',
    );

    // Simulate restoring onto a clean device/vault.
    mockAsyncStorage.__reset();
    mockRNFS.__reset();

    const summary = await importVaultBackup(
      vaultKey,
      exported,
      'correct horse battery staple',
    );

    expect(summary.wifiCredentials).toBe(1);
    expect(summary.secureNotes).toBe(1);
    expect(summary.attachments).toBe(1);
    expect(await listWifiCredentials(vaultKey)).toEqual([
      { id: 'w1', ssid: 'HomeWifi', password: 'pw', notes: '' },
    ]);
    expect(await listSecureNotes(vaultKey)).toEqual([
      { id: 'n1', title: 'My Note', body: 'body text' },
    ]);
    expect(
      await listAttachmentsForEntry(vaultKey, 'secureNotes', 'n1'),
    ).toHaveLength(1);
  });

  it('produces a backup file that never contains any plaintext field or file content', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'super-secret-password',
      notes: '',
    });
    await addAttachment(vaultKey, {
      entryType: 'wifiCredentials',
      entryId: 'w1',
      fileName: 'router-photo.jpg',
      mimeType: 'image/jpeg',
      data: Buffer.from('this-is-the-photo-plaintext-marker'),
    });

    const exported = await exportVaultBackup(vaultKey, 'a-passphrase');

    expect(exported).not.toContain('HomeWifi');
    expect(exported).not.toContain('super-secret-password');
    expect(exported).not.toContain('router-photo.jpg');
    expect(exported).not.toContain('this-is-the-photo-plaintext-marker');
  });

  it('rejects import with the wrong passphrase', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    const exported = await exportVaultBackup(vaultKey, 'correct-passphrase');

    await expect(
      importVaultBackup(vaultKey, exported, 'wrong-passphrase'),
    ).rejects.toThrow(BackupDecryptionError);
  });
});
