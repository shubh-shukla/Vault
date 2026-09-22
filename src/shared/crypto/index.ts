export {
  provisionVaultKeyIfNeeded,
  unlockVaultKey,
  deriveSubkey,
} from './deriveVaultKey';
export {
  deleteMasterSeed,
  VaultAuthenticationError,
  VaultKeyNotProvisionedError,
} from './vaultKeychainService';
export { encryptField } from './encryptField';
export { decryptField } from './decryptField';
export { encryptRecord } from './encryptRecord';
export { decryptRecord } from './decryptRecord';
export { encryptAttachment } from './encryptAttachment';
export { decryptAttachment } from './decryptAttachment';
export type { EncryptedEnvelope, KeyPurpose, VaultKeyMaterial } from './types';
