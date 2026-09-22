import {
  decryptField,
  deriveExportKey,
  encryptField,
  generateExportSalt,
} from '@shared/crypto';
import {
  listWifiCredentials,
  saveWifiCredential,
} from '@features/wifiCredentials';
import { listLicenseKeys, saveLicenseKey } from '@features/licenseKeys';
import {
  listRecoveryCodeEntries,
  saveRecoveryCodeEntry,
} from '@features/recoveryCodes';
import {
  listImportantNumbers,
  saveImportantNumber,
} from '@features/importantNumbers';
import { listDeviceDetails, saveDeviceDetail } from '@features/deviceDetails';
import { listSecureNotes, saveSecureNote } from '@features/secureNotes';
import {
  addAttachment,
  listAttachmentsForEntry,
  readAttachmentData,
} from '@features/attachments';
import type {
  EncryptedBackupFile,
  ImportSummary,
  VaultBackupPayload,
} from './types';

const BACKUP_FORMAT_VERSION = 1;

export class BackupDecryptionError extends Error {
  constructor(
    message = 'Incorrect passphrase or corrupted backup file',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'BackupDecryptionError';
  }
}

async function collectPayload(vaultKey: Buffer): Promise<VaultBackupPayload> {
  const [
    wifiCredentials,
    licenseKeys,
    recoveryCodes,
    importantNumbers,
    deviceDetails,
    secureNotes,
  ] = await Promise.all([
    listWifiCredentials(vaultKey),
    listLicenseKeys(vaultKey),
    listRecoveryCodeEntries(vaultKey),
    listImportantNumbers(vaultKey),
    listDeviceDetails(vaultKey),
    listSecureNotes(vaultKey),
  ]);

  const entryRefs: Array<{ entryType: string; entryId: string }> = [
    ...wifiCredentials.map(entry => ({
      entryType: 'wifiCredentials',
      entryId: entry.id,
    })),
    ...licenseKeys.map(entry => ({
      entryType: 'licenseKeys',
      entryId: entry.id,
    })),
    ...recoveryCodes.map(entry => ({
      entryType: 'recoveryCodes',
      entryId: entry.id,
    })),
    ...importantNumbers.map(entry => ({
      entryType: 'importantNumbers',
      entryId: entry.id,
    })),
    ...deviceDetails.map(entry => ({
      entryType: 'deviceDetails',
      entryId: entry.id,
    })),
    ...secureNotes.map(entry => ({
      entryType: 'secureNotes',
      entryId: entry.id,
    })),
  ];

  const attachmentGroups = await Promise.all(
    entryRefs.map(ref =>
      listAttachmentsForEntry(vaultKey, ref.entryType, ref.entryId),
    ),
  );

  const attachments = await Promise.all(
    attachmentGroups.flat().map(async metadata => ({
      metadata,
      dataBase64: (
        await readAttachmentData(vaultKey, metadata.storageId)
      ).toString('base64'),
    })),
  );

  return {
    wifiCredentials,
    licenseKeys,
    recoveryCodes,
    importantNumbers,
    deviceDetails,
    secureNotes,
    attachments,
  };
}

export async function exportVaultBackup(
  vaultKey: Buffer,
  passphrase: string,
): Promise<string> {
  const payload = await collectPayload(vaultKey);
  const salt = generateExportSalt();
  const exportKey = deriveExportKey(passphrase, salt);
  const envelope = encryptField(JSON.stringify(payload), exportKey);

  const file: EncryptedBackupFile = {
    version: BACKUP_FORMAT_VERSION,
    kdf: 'scrypt',
    salt: salt.toString('base64'),
    envelope,
  };
  return JSON.stringify(file);
}

export async function importVaultBackup(
  vaultKey: Buffer,
  fileContents: string,
  passphrase: string,
): Promise<ImportSummary> {
  const file: EncryptedBackupFile = JSON.parse(fileContents);
  const salt = Buffer.from(file.salt, 'base64');
  const exportKey = deriveExportKey(passphrase, salt);

  let plaintext: string;
  try {
    plaintext = decryptField(file.envelope, exportKey);
  } catch (cause) {
    throw new BackupDecryptionError(undefined, { cause });
  }

  const payload: VaultBackupPayload = JSON.parse(plaintext);

  await Promise.all(
    payload.wifiCredentials.map(entry => saveWifiCredential(vaultKey, entry)),
  );
  await Promise.all(
    payload.licenseKeys.map(entry => saveLicenseKey(vaultKey, entry)),
  );
  await Promise.all(
    payload.recoveryCodes.map(entry => saveRecoveryCodeEntry(vaultKey, entry)),
  );
  await Promise.all(
    payload.importantNumbers.map(entry => saveImportantNumber(vaultKey, entry)),
  );
  await Promise.all(
    payload.deviceDetails.map(entry => saveDeviceDetail(vaultKey, entry)),
  );
  await Promise.all(
    payload.secureNotes.map(entry => saveSecureNote(vaultKey, entry)),
  );
  await Promise.all(
    payload.attachments.map(({ metadata, dataBase64 }) =>
      addAttachment(vaultKey, {
        entryType: metadata.entryType,
        entryId: metadata.entryId,
        fileName: metadata.fileName,
        mimeType: metadata.mimeType,
        data: Buffer.from(dataBase64, 'base64'),
      }),
    ),
  );

  return {
    wifiCredentials: payload.wifiCredentials.length,
    licenseKeys: payload.licenseKeys.length,
    recoveryCodes: payload.recoveryCodes.length,
    importantNumbers: payload.importantNumbers.length,
    deviceDetails: payload.deviceDetails.length,
    secureNotes: payload.secureNotes.length,
    attachments: payload.attachments.length,
  };
}
