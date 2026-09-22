import uuid from 'react-native-uuid';
import {
  decryptAttachment,
  decryptRecord,
  deriveSubkey,
  encryptAttachment,
  encryptRecord,
} from '@shared/crypto';
import {
  deleteEncryptedAttachmentFile,
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  readEncryptedAttachmentFile,
  saveEncryptedRecord,
  writeEncryptedAttachmentFile,
} from '@shared/storage';
import type { AttachmentInput, AttachmentMetadata } from './types';

const COLLECTION = 'attachments';

export async function listAttachmentsForEntry(
  vaultKey: Buffer,
  entryType: string,
  entryId: string,
): Promise<AttachmentMetadata[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(COLLECTION);
  return records
    .map(({ envelope }) =>
      decryptRecord<AttachmentMetadata>(envelope, fieldKey),
    )
    .filter(
      metadata =>
        metadata.entryType === entryType && metadata.entryId === entryId,
    );
}

export async function addAttachment(
  vaultKey: Buffer,
  input: AttachmentInput,
): Promise<AttachmentMetadata> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const attachmentKey = deriveSubkey(vaultKey, 'attachment-encryption');

  const storageId = uuid.v4() as string;
  await writeEncryptedAttachmentFile(
    storageId,
    encryptAttachment(input.data, attachmentKey),
  );

  const metadata: AttachmentMetadata = {
    id: uuid.v4() as string,
    entryType: input.entryType,
    entryId: input.entryId,
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.data.length,
    storageId,
  };
  await saveEncryptedRecord(
    COLLECTION,
    metadata.id,
    encryptRecord(metadata, fieldKey),
  );

  return metadata;
}

export async function readAttachmentData(
  vaultKey: Buffer,
  storageId: string,
): Promise<Buffer> {
  const attachmentKey = deriveSubkey(vaultKey, 'attachment-encryption');
  const sealed = await readEncryptedAttachmentFile(storageId);
  return decryptAttachment(sealed, attachmentKey);
}

export async function removeAttachment(
  metadata: AttachmentMetadata,
): Promise<void> {
  await deleteEncryptedRecord(COLLECTION, metadata.id);
  await deleteEncryptedAttachmentFile(metadata.storageId);
}
