import RNFS from 'react-native-fs';

const ATTACHMENT_DIRECTORY = `${RNFS.DocumentDirectoryPath}/vault-attachments`;

function pathFor(storageId: string): string {
  return `${ATTACHMENT_DIRECTORY}/${storageId}`;
}

async function ensureAttachmentDirectoryExists(): Promise<void> {
  const exists = await RNFS.exists(ATTACHMENT_DIRECTORY);
  if (!exists) {
    await RNFS.mkdir(ATTACHMENT_DIRECTORY);
  }
}

export async function writeEncryptedAttachmentFile(
  storageId: string,
  sealed: Buffer,
): Promise<void> {
  await ensureAttachmentDirectoryExists();
  await RNFS.writeFile(pathFor(storageId), sealed.toString('base64'), 'base64');
}

export async function readEncryptedAttachmentFile(
  storageId: string,
): Promise<Buffer> {
  const base64 = await RNFS.readFile(pathFor(storageId), 'base64');
  return Buffer.from(base64, 'base64');
}

export async function deleteEncryptedAttachmentFile(
  storageId: string,
): Promise<void> {
  const path = pathFor(storageId);
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path);
  }
}
