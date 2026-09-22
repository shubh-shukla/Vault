import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {
  addAttachment,
  listAttachmentsForEntry,
  readAttachmentData,
  removeAttachment,
} from '../attachmentRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const mockRNFS = RNFS as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
  mockRNFS.__reset();
});

describe('attachmentRepository', () => {
  it('adds an attachment and round-trips its data through readAttachmentData', async () => {
    const data = Buffer.from('the raw file bytes');

    const metadata = await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'note-1',
      fileName: 'receipt.pdf',
      mimeType: 'application/pdf',
      data,
    });

    expect(metadata.fileName).toBe('receipt.pdf');
    expect(metadata.sizeBytes).toBe(data.length);
    expect(await readAttachmentData(vaultKey, metadata.storageId)).toEqual(
      data,
    );
  });

  it('lists attachments scoped to a single entry, excluding other entries', async () => {
    await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'note-1',
      fileName: 'a.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('a'),
    });
    await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'note-2',
      fileName: 'b.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('b'),
    });
    await addAttachment(vaultKey, {
      entryType: 'wifiCredentials',
      entryId: 'note-1',
      fileName: 'c.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('c'),
    });

    const results = await listAttachmentsForEntry(
      vaultKey,
      'secureNotes',
      'note-1',
    );
    expect(results).toHaveLength(1);
    expect(results[0].fileName).toBe('a.pdf');
  });

  it('never persists the plaintext file name or bytes to AsyncStorage', async () => {
    await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'note-1',
      fileName: 'top-secret-plan.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('super secret contents'),
    });

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('top-secret-plan.pdf');
      expect(raw).not.toContain('super secret contents');
    }
  });

  it('never writes the plaintext file bytes to the filesystem', async () => {
    await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'note-1',
      fileName: 'a.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('super secret contents'),
    });

    const writeCall = (RNFS.writeFile as jest.Mock).mock.calls[0];
    const [, writtenBase64] = writeCall;
    expect(Buffer.from(writtenBase64, 'base64').toString()).not.toContain(
      'super secret contents',
    );
  });

  it('removing an attachment deletes both its metadata and its file', async () => {
    const metadata = await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'note-1',
      fileName: 'a.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('a'),
    });

    await removeAttachment(metadata);

    expect(
      await listAttachmentsForEntry(vaultKey, 'secureNotes', 'note-1'),
    ).toEqual([]);
    await expect(
      readAttachmentData(vaultKey, metadata.storageId),
    ).rejects.toThrow();
  });

  it('cannot decrypt attachment data with a different vault key', async () => {
    const metadata = await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'note-1',
      fileName: 'a.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('a'),
    });

    const wrongKey = Buffer.alloc(32, 7);
    await expect(
      readAttachmentData(wrongKey, metadata.storageId),
    ).rejects.toThrow();
  });
});
