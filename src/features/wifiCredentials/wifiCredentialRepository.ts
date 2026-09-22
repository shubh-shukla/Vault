import { decryptRecord, deriveSubkey, encryptRecord } from '@shared/crypto';
import {
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  saveEncryptedRecord,
} from '@shared/storage';
import type { WifiCredential } from './types';

const COLLECTION = 'wifiCredentials';

export async function listWifiCredentials(
  vaultKey: Buffer,
): Promise<WifiCredential[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(COLLECTION);
  return records.map(({ envelope }) =>
    decryptRecord<WifiCredential>(envelope, fieldKey),
  );
}

export async function saveWifiCredential(
  vaultKey: Buffer,
  credential: WifiCredential,
): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  await saveEncryptedRecord(
    COLLECTION,
    credential.id,
    encryptRecord(credential, fieldKey),
  );
}

export async function deleteWifiCredential(id: string): Promise<void> {
  await deleteEncryptedRecord(COLLECTION, id);
}
