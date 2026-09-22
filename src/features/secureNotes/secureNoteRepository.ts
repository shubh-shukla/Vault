import { decryptRecord, deriveSubkey, encryptRecord } from '@shared/crypto';
import {
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  saveEncryptedRecord,
} from '@shared/storage';
import type { SecureNoteEntry } from './types';

const COLLECTION = 'secureNotes';

export async function listSecureNotes(
  vaultKey: Buffer,
): Promise<SecureNoteEntry[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(COLLECTION);
  return records.map(({ envelope }) =>
    decryptRecord<SecureNoteEntry>(envelope, fieldKey),
  );
}

export async function saveSecureNote(
  vaultKey: Buffer,
  entry: SecureNoteEntry,
): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  await saveEncryptedRecord(
    COLLECTION,
    entry.id,
    encryptRecord(entry, fieldKey),
  );
}

export async function deleteSecureNote(id: string): Promise<void> {
  await deleteEncryptedRecord(COLLECTION, id);
}
