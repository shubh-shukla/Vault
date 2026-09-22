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
export { encryptAttachment } from './encryptAttachment';
export { decryptAttachment } from './decryptAttachment';
export type { EncryptedEnvelope, KeyPurpose, VaultKeyMaterial } from './types';
