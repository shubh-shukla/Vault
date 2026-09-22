import { decryptField } from './decryptField';
import type { EncryptedEnvelope } from './types';

export function decryptRecord<T>(envelope: EncryptedEnvelope, key: Buffer): T {
  return JSON.parse(decryptField(envelope, key)) as T;
}
