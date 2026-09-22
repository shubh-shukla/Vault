import { encryptAttachment } from '../encryptAttachment';
import { decryptAttachment } from '../decryptAttachment';

const key = Buffer.alloc(32, 3);

describe('encryptAttachment / decryptAttachment', () => {
  it('round-trips binary attachment data', () => {
    const plaintext = Buffer.from([0, 1, 2, 3, 250, 251, 252, 253, 254, 255]);
    const sealed = encryptAttachment(plaintext, key);

    expect(decryptAttachment(sealed, key)).toEqual(plaintext);
  });

  it('round-trips a large buffer', () => {
    const plaintext = Buffer.alloc(1024 * 64, 42);
    const sealed = encryptAttachment(plaintext, key);

    expect(decryptAttachment(sealed, key)).toEqual(plaintext);
  });

  it('never leaves the plaintext bytes present in the sealed buffer', () => {
    const plaintext = Buffer.from(
      'this-is-attachment-plaintext-marker',
      'utf8',
    );
    const sealed = encryptAttachment(plaintext, key);

    expect(sealed.includes(plaintext)).toBe(false);
  });

  it('fails to decrypt with the wrong key', () => {
    const plaintext = Buffer.from('attachment-bytes', 'utf8');
    const sealed = encryptAttachment(plaintext, key);
    const wrongKey = Buffer.alloc(32, 8);

    expect(() => decryptAttachment(sealed, wrongKey)).toThrow();
  });

  it('fails to decrypt a truncated buffer', () => {
    const plaintext = Buffer.from('attachment-bytes', 'utf8');
    const sealed = encryptAttachment(plaintext, key);

    expect(() =>
      decryptAttachment(sealed.subarray(0, sealed.length - 1), key),
    ).toThrow();
  });
});
