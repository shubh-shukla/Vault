import { decryptRecord, deriveSubkey, encryptRecord } from '@shared/crypto';
import {
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  saveEncryptedRecord,
} from '@shared/storage';
import type { LicenseKey } from './types';

const COLLECTION = 'licenseKeys';

export async function listLicenseKeys(vaultKey: Buffer): Promise<LicenseKey[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(COLLECTION);
  return records.map(({ envelope }) =>
    decryptRecord<LicenseKey>(envelope, fieldKey),
  );
}

export async function saveLicenseKey(
  vaultKey: Buffer,
  licenseKey: LicenseKey,
): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  await saveEncryptedRecord(
    COLLECTION,
    licenseKey.id,
    encryptRecord(licenseKey, fieldKey),
  );
}

export async function deleteLicenseKey(id: string): Promise<void> {
  await deleteEncryptedRecord(COLLECTION, id);
}
