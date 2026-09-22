import { encryptBuffer } from './aesGcm';
import type { EncryptedEnvelope } from './types';

export function encryptField(
  plaintext: string,
  key: Buffer,
): EncryptedEnvelope {
  const { iv, ciphertext, authTag } = encryptBuffer(
    Buffer.from(plaintext, 'utf8'),
    key,
  );

  return {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}
