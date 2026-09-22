import { encryptField } from '../encryptField';
import { decryptField } from '../decryptField';

const key = Buffer.alloc(32, 7);
const otherKey = Buffer.alloc(32, 9);

describe('encryptField / decryptField', () => {
  it('round-trips a plaintext string', () => {
    const envelope = encryptField('correlation-horizon-wifi-password', key);
    expect(decryptField(envelope, key)).toBe(
      'correlation-horizon-wifi-password',
    );
  });

  it('round-trips an empty string', () => {
    const envelope = encryptField('', key);
    expect(decryptField(envelope, key)).toBe('');
  });

  it('never stores the plaintext in the envelope', () => {
    const plaintext = 'sk_live_super_secret_license_key';
    const envelope = encryptField(plaintext, key);

    expect(envelope.ciphertext).not.toContain(plaintext);
    expect(JSON.stringify(envelope)).not.toContain(plaintext);
  });

  it('produces a different ciphertext for the same plaintext on each call', () => {
    const first = encryptField('repeat-me', key);
    const second = encryptField('repeat-me', key);

    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });

  it('fails to decrypt with the wrong key', () => {
    const envelope = encryptField('wifi-password-123', key);
    expect(() => decryptField(envelope, otherKey)).toThrow();
  });

  it('fails to decrypt a tampered ciphertext', () => {
    const envelope = encryptField('device-serial-ABC123', key);
    const tamperedByte = Buffer.from(envelope.ciphertext, 'base64');
    // eslint-disable-next-line no-bitwise -- flipping a byte to simulate ciphertext tampering
    tamperedByte[0] = tamperedByte[0] ^ 0xff;

    expect(() =>
      decryptField(
        { ...envelope, ciphertext: tamperedByte.toString('base64') },
        key,
      ),
    ).toThrow();
  });

  it('fails to decrypt a tampered auth tag', () => {
    const envelope = encryptField('recovery-code-9F2K', key);
    const tamperedTag = Buffer.from(envelope.authTag, 'base64');
    // eslint-disable-next-line no-bitwise -- flipping a byte to simulate auth tag tampering
    tamperedTag[0] = tamperedTag[0] ^ 0xff;

    expect(() =>
      decryptField(
        { ...envelope, authTag: tamperedTag.toString('base64') },
        key,
      ),
    ).toThrow();
  });
});
