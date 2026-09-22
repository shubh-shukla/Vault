import { encryptRecord } from '../encryptRecord';
import { decryptRecord } from '../decryptRecord';

const key = Buffer.alloc(32, 11);

interface Sample {
  id: string;
  ssid: string;
  password: string;
  notes?: string;
}

describe('encryptRecord / decryptRecord', () => {
  it('round-trips an arbitrary JSON-serializable record', () => {
    const record: Sample = {
      id: 'a1',
      ssid: 'HomeWifi',
      password: 'correct-horse',
      notes: 'guest room',
    };
    const envelope = encryptRecord(record, key);

    expect(decryptRecord<Sample>(envelope, key)).toEqual(record);
  });

  it('never leaks a record field into the envelope', () => {
    const record: Sample = {
      id: 'a2',
      ssid: 'OfficeWifi',
      password: 'sk_super_secret',
    };
    const envelope = encryptRecord(record, key);

    expect(JSON.stringify(envelope)).not.toContain('sk_super_secret');
    expect(JSON.stringify(envelope)).not.toContain('OfficeWifi');
  });

  it('fails to decrypt with the wrong key', () => {
    const record: Sample = { id: 'a3', ssid: 'GuestWifi', password: 'letmein' };
    const envelope = encryptRecord(record, key);
    const wrongKey = Buffer.alloc(32, 99);

    expect(() => decryptRecord<Sample>(envelope, wrongKey)).toThrow();
  });
});
