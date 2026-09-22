import { decryptRecord, deriveSubkey, encryptRecord } from '@shared/crypto';
import {
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  saveEncryptedRecord,
} from '@shared/storage';
import type { DeviceDetailEntry } from './types';

const COLLECTION = 'deviceDetails';

export async function listDeviceDetails(
  vaultKey: Buffer,
): Promise<DeviceDetailEntry[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(COLLECTION);
  return records.map(({ envelope }) =>
    decryptRecord<DeviceDetailEntry>(envelope, fieldKey),
  );
}

export async function saveDeviceDetail(
  vaultKey: Buffer,
  entry: DeviceDetailEntry,
): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  await saveEncryptedRecord(
    COLLECTION,
    entry.id,
    encryptRecord(entry, fieldKey),
  );
}

export async function deleteDeviceDetail(id: string): Promise<void> {
  await deleteEncryptedRecord(COLLECTION, id);
}
