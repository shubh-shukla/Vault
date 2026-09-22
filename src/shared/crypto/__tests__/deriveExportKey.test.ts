import { deriveExportKey, generateExportSalt } from '../deriveExportKey';

describe('generateExportSalt / deriveExportKey', () => {
  it('generates a fresh salt on every call', () => {
    expect(generateExportSalt()).not.toEqual(generateExportSalt());
  });

  it('is deterministic for the same passphrase and salt', () => {
    const salt = generateExportSalt();
    expect(deriveExportKey('correct horse battery staple', salt)).toEqual(
      deriveExportKey('correct horse battery staple', salt),
    );
  });

  it('derives different keys for different passphrases with the same salt', () => {
    const salt = generateExportSalt();
    expect(deriveExportKey('passphrase-a', salt)).not.toEqual(
      deriveExportKey('passphrase-b', salt),
    );
  });

  it('derives different keys for the same passphrase with different salts', () => {
    expect(deriveExportKey('passphrase', generateExportSalt())).not.toEqual(
      deriveExportKey('passphrase', generateExportSalt()),
    );
  });

  it('derives a 32-byte key', () => {
    expect(deriveExportKey('passphrase', generateExportSalt())).toHaveLength(
      32,
    );
  });
});
