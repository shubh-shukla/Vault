import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveWifiCredential } from '@features/wifiCredentials';
import { saveLicenseKey } from '@features/licenseKeys';
import { saveRecoveryCodeEntry } from '@features/recoveryCodes';
import { saveImportantNumber } from '@features/importantNumbers';
import { saveDeviceDetail } from '@features/deviceDetails';
import { saveSecureNote } from '@features/secureNotes';
import { buildSearchIndex } from '../buildSearchIndex';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('buildSearchIndex', () => {
  it('aggregates one entry from every entry type', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    await saveLicenseKey(vaultKey, {
      id: 'l1',
      productName: 'Photo Editor',
      key: 'XXXX',
      purchaseNotes: '',
    });
    await saveRecoveryCodeEntry(vaultKey, {
      id: 'r1',
      serviceName: 'GitHub',
      codes: ['a'],
      notes: '',
    });
    await saveImportantNumber(vaultKey, {
      id: 'i1',
      label: 'PIN',
      value: '1234',
    });
    await saveDeviceDetail(vaultKey, {
      id: 'd1',
      deviceName: 'MacBook',
      serialNumber: 'SN',
      specs: '',
      notes: '',
    });
    await saveSecureNote(vaultKey, {
      id: 'n1',
      title: 'My Note',
      body: 'body',
    });

    const index = await buildSearchIndex(vaultKey);

    expect(index).toHaveLength(6);
    expect(index).toEqual(
      expect.arrayContaining([
        {
          entryType: 'wifiCredentials',
          entryId: 'w1',
          title: 'HomeWifi',
          subtitle: 'Wi-Fi credential',
        },
        {
          entryType: 'licenseKeys',
          entryId: 'l1',
          title: 'Photo Editor',
          subtitle: 'License key',
        },
        {
          entryType: 'recoveryCodes',
          entryId: 'r1',
          title: 'GitHub',
          subtitle: 'Recovery codes',
        },
        {
          entryType: 'importantNumbers',
          entryId: 'i1',
          title: 'PIN',
          subtitle: 'Important number',
        },
        {
          entryType: 'deviceDetails',
          entryId: 'd1',
          title: 'MacBook',
          subtitle: 'Device',
        },
        {
          entryType: 'secureNotes',
          entryId: 'n1',
          title: 'My Note',
          subtitle: 'Secure note',
        },
      ]),
    );
  });

  it('falls back to "Untitled note" for a secure note with no title', async () => {
    await saveSecureNote(vaultKey, { id: 'n1', title: '', body: 'body' });

    const index = await buildSearchIndex(vaultKey);

    expect(index[0].title).toBe('Untitled note');
  });

  it('never writes anything to storage while building the index', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    (AsyncStorage.setItem as jest.Mock).mockClear();

    await buildSearchIndex(vaultKey);

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
