import QuickCrypto from 'react-native-quick-crypto';

const EXPORT_SALT_LENGTH = 16;
const EXPORT_KEY_LENGTH = 32;

export function generateExportSalt(): Buffer {
  return Buffer.from(QuickCrypto.randomBytes(EXPORT_SALT_LENGTH));
}

export function deriveExportKey(passphrase: string, salt: Buffer): Buffer {
  return Buffer.from(
    QuickCrypto.scryptSync(passphrase, salt, EXPORT_KEY_LENGTH),
  );
}
