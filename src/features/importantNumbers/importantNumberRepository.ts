import { decryptRecord, deriveSubkey, encryptRecord } from '@shared/crypto';
import {
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  saveEncryptedRecord,
} from '@shared/storage';
import type { ImportantNumberEntry } from './types';

const COLLECTION = 'importantNumbers';

export async function listImportantNumbers(
  vaultKey: Buffer,
): Promise<ImportantNumberEntry[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(COLLECTION);
  return records.map(({ envelope }) =>
    decryptRecord<ImportantNumberEntry>(envelope, fieldKey),
  );
}

export async function saveImportantNumber(
  vaultKey: Buffer,
  entry: ImportantNumberEntry,
): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  await saveEncryptedRecord(
    COLLECTION,
    entry.id,
    encryptRecord(entry, fieldKey),
  );
}

export async function deleteImportantNumber(id: string): Promise<void> {
  await deleteEncryptedRecord(COLLECTION, id);
}
