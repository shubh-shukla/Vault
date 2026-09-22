import { decryptRecord, deriveSubkey, encryptRecord } from '@shared/crypto';
import {
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  saveEncryptedRecord,
} from '@shared/storage';
import type { RecoveryCodeEntry } from './types';

const COLLECTION = 'recoveryCodes';

export async function listRecoveryCodeEntries(
  vaultKey: Buffer,
): Promise<RecoveryCodeEntry[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(COLLECTION);
  return records.map(({ envelope }) =>
    decryptRecord<RecoveryCodeEntry>(envelope, fieldKey),
  );
}

export async function saveRecoveryCodeEntry(
  vaultKey: Buffer,
  entry: RecoveryCodeEntry,
): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  await saveEncryptedRecord(
    COLLECTION,
    entry.id,
    encryptRecord(entry, fieldKey),
  );
}

export async function deleteRecoveryCodeEntry(id: string): Promise<void> {
  await deleteEncryptedRecord(COLLECTION, id);
}
