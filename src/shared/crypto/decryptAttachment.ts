import { AES_GCM_IV_LENGTH, decryptBuffer } from './aesGcm';
import { ATTACHMENT_HEADER_LENGTH } from './encryptAttachment';

export function decryptAttachment(sealed: Buffer, key: Buffer): Buffer {
  const iv = sealed.subarray(0, AES_GCM_IV_LENGTH);
  const authTag = sealed.subarray(AES_GCM_IV_LENGTH, ATTACHMENT_HEADER_LENGTH);
  const ciphertext = sealed.subarray(ATTACHMENT_HEADER_LENGTH);

  return decryptBuffer({ iv, ciphertext, authTag }, key);
}
