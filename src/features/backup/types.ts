import type { EncryptedEnvelope } from '@shared/crypto';
import type { WifiCredential } from '@features/wifiCredentials';
import type { LicenseKey } from '@features/licenseKeys';
import type { RecoveryCodeEntry } from '@features/recoveryCodes';
import type { ImportantNumberEntry } from '@features/importantNumbers';
import type { DeviceDetailEntry } from '@features/deviceDetails';
import type { SecureNoteEntry } from '@features/secureNotes';
import type { AttachmentMetadata } from '@features/attachments';

export interface VaultBackupPayload {
  wifiCredentials: WifiCredential[];
  licenseKeys: LicenseKey[];
  recoveryCodes: RecoveryCodeEntry[];
  importantNumbers: ImportantNumberEntry[];
  deviceDetails: DeviceDetailEntry[];
  secureNotes: SecureNoteEntry[];
  attachments: Array<{ metadata: AttachmentMetadata; dataBase64: string }>;
}

export interface EncryptedBackupFile {
  version: 1;
  kdf: 'scrypt';
  salt: string;
  envelope: EncryptedEnvelope;
}

export interface ImportSummary {
  wifiCredentials: number;
  licenseKeys: number;
  recoveryCodes: number;
  importantNumbers: number;
  deviceDetails: number;
  secureNotes: number;
  attachments: number;
}
