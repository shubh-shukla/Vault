export interface EncryptedEnvelope {
  iv: string;
  ciphertext: string;
  authTag: string;
}

export type KeyPurpose = 'field-encryption' | 'attachment-encryption';

export interface VaultKeyMaterial {
  seed: Buffer;
}
