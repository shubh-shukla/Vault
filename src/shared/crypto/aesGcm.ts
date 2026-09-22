import QuickCrypto from 'react-native-quick-crypto';

export const AES_GCM_ALGORITHM = 'aes-256-gcm';
export const AES_GCM_KEY_LENGTH = 32;
export const AES_GCM_IV_LENGTH = 12;

export interface AesGcmCiphertext {
  iv: Buffer;
  ciphertext: Buffer;
  authTag: Buffer;
}

export function encryptBuffer(
  plaintext: Buffer,
  key: Buffer,
): AesGcmCiphertext {
  const iv = Buffer.from(QuickCrypto.randomBytes(AES_GCM_IV_LENGTH));
  const cipher = QuickCrypto.createCipheriv(AES_GCM_ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = Buffer.from(cipher.getAuthTag());

  return { iv, ciphertext, authTag };
}

export function decryptBuffer(
  { iv, ciphertext, authTag }: AesGcmCiphertext,
  key: Buffer,
): Buffer {
  const decipher = QuickCrypto.createDecipheriv(AES_GCM_ALGORITHM, key, iv);
  // react-native-quick-crypto's setAuthTag expects its own Buffer class (from
  // @craftzdog/react-native-buffer), which @types/node's newer generic Buffer
  // doesn't structurally satisfy even though both wrap the same bytes.
  decipher.setAuthTag(QuickCrypto.Buffer.from(authTag));
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
