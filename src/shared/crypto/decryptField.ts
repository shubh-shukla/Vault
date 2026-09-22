import { decryptBuffer } from './aesGcm';
import type { EncryptedEnvelope } from './types';

export function decryptField(envelope: EncryptedEnvelope, key: Buffer): string {
  const plaintext = decryptBuffer(
    {
      iv: Buffer.from(envelope.iv, 'base64'),
      ciphertext: Buffer.from(envelope.ciphertext, 'base64'),
      authTag: Buffer.from(envelope.authTag, 'base64'),
    },
    key,
  );

  return plaintext.toString('utf8');
}
