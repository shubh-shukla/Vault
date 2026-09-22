import { AES_GCM_IV_LENGTH, encryptBuffer } from './aesGcm';

const AUTH_TAG_LENGTH = 16;

export function encryptAttachment(plaintext: Buffer, key: Buffer): Buffer {
  const { iv, ciphertext, authTag } = encryptBuffer(plaintext, key);
  return Buffer.concat([iv, authTag, ciphertext]);
}

export const ATTACHMENT_HEADER_LENGTH = AES_GCM_IV_LENGTH + AUTH_TAG_LENGTH;
