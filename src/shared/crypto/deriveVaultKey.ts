import QuickCrypto from 'react-native-quick-crypto';
import {
  hasStoredMasterSeed,
  retrieveMasterSeed,
  storeMasterSeed,
} from './vaultKeychainService';
import type { KeyPurpose } from './types';

const MASTER_SEED_LENGTH = 32;
const HKDF_DIGEST = 'sha256';
const HKDF_SALT = Buffer.from('vault/hkdf-salt/v1', 'utf8');
const SUBKEY_LENGTH = 32;

export async function provisionVaultKeyIfNeeded(): Promise<void> {
  const alreadyProvisioned = await hasStoredMasterSeed();
  if (alreadyProvisioned) {
    return;
  }

  const seed = Buffer.from(QuickCrypto.randomBytes(MASTER_SEED_LENGTH));
  await storeMasterSeed(seed);
}

export async function unlockVaultKey(): Promise<Buffer> {
  return retrieveMasterSeed();
}

export function deriveSubkey(masterSeed: Buffer, purpose: KeyPurpose): Buffer {
  return Buffer.from(
    QuickCrypto.hkdfSync(
      HKDF_DIGEST,
      masterSeed,
      HKDF_SALT,
      Buffer.from(purpose, 'utf8'),
      SUBKEY_LENGTH,
    ),
  );
}
