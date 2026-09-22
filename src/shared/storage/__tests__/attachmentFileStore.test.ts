import RNFS from 'react-native-fs';
import {
  writeEncryptedAttachmentFile,
  readEncryptedAttachmentFile,
  deleteEncryptedAttachmentFile,
} from '../attachmentFileStore';

const mockRNFS = RNFS as unknown as { __reset: () => void };

beforeEach(() => {
  mockRNFS.__reset();
});

describe('attachmentFileStore', () => {
  it('round-trips sealed attachment bytes through write and read', async () => {
    const sealed = Buffer.from('sealed-attachment-bytes');

    await writeEncryptedAttachmentFile('storage-id-1', sealed);

    expect(await readEncryptedAttachmentFile('storage-id-1')).toEqual(sealed);
  });

  it('creates the attachment directory on first write', async () => {
    await writeEncryptedAttachmentFile('storage-id-1', Buffer.from('data'));

    expect(RNFS.mkdir).toHaveBeenCalledTimes(1);
  });

  it('does not recreate the directory on a second write', async () => {
    await writeEncryptedAttachmentFile('storage-id-1', Buffer.from('data'));
    await writeEncryptedAttachmentFile(
      'storage-id-2',
      Buffer.from('more data'),
    );

    expect(RNFS.mkdir).toHaveBeenCalledTimes(1);
  });

  it('never writes plaintext bytes to disk — only base64 ciphertext', async () => {
    const plaintextMarker = 'this-is-the-plaintext-marker';
    const sealed = Buffer.from(`sealed(${plaintextMarker})`);

    await writeEncryptedAttachmentFile('storage-id-1', sealed);

    const writeCall = (RNFS.writeFile as jest.Mock).mock.calls[0];
    const [, writtenContents, encoding] = writeCall;
    expect(encoding).toBe('base64');
    expect(Buffer.from(writtenContents, 'base64').toString()).toBe(
      `sealed(${plaintextMarker})`,
    );
  });

  it('deletes an attachment file', async () => {
    await writeEncryptedAttachmentFile('storage-id-1', Buffer.from('data'));
    await deleteEncryptedAttachmentFile('storage-id-1');

    await expect(readEncryptedAttachmentFile('storage-id-1')).rejects.toThrow();
  });

  it('deleting a file that never existed is a no-op', async () => {
    await expect(
      deleteEncryptedAttachmentFile('never-existed'),
    ).resolves.toBeUndefined();
  });
});
