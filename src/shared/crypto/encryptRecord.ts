import { encryptField } from './encryptField';
import type { EncryptedEnvelope } from './types';

export function encryptRecord<T>(record: T, key: Buffer): EncryptedEnvelope {
  return encryptField(JSON.stringify(record), key);
}
