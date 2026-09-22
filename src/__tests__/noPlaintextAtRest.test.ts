import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { saveWifiCredential } from '@features/wifiCredentials';
import { saveLicenseKey } from '@features/licenseKeys';
import { saveRecoveryCodeEntry } from '@features/recoveryCodes';
import { saveImportantNumber } from '@features/importantNumbers';
import { saveDeviceDetail } from '@features/deviceDetails';
import { saveSecureNote } from '@features/secureNotes';
import { addAttachment } from '@features/attachments';
import { assignTag, createTag } from '@features/tags';
import { buildSearchIndex } from '@features/search';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const mockRNFS = RNFS as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

// One unmistakable marker per plaintext value, so a leak of any of them
// anywhere is unambiguous — a generic word could plausibly collide with
// something else; these strings cannot.
const MARKERS = {
  wifiSsid: 'MARKER_WIFI_SSID_f3a1',
  wifiPassword: 'MARKER_WIFI_PASSWORD_f3a1',
  licenseProduct: 'MARKER_LICENSE_PRODUCT_f3a1',
  licenseKey: 'MARKER_LICENSE_KEY_f3a1',
  recoveryService: 'MARKER_RECOVERY_SERVICE_f3a1',
  recoveryCode: 'MARKER_RECOVERY_CODE_f3a1',
  numberLabel: 'MARKER_NUMBER_LABEL_f3a1',
  numberValue: 'MARKER_NUMBER_VALUE_f3a1',
  deviceName: 'MARKER_DEVICE_NAME_f3a1',
  deviceSerial: 'MARKER_DEVICE_SERIAL_f3a1',
  noteTitle: 'MARKER_NOTE_TITLE_f3a1',
  noteBody: 'MARKER_NOTE_BODY_f3a1',
  attachmentFileName: 'MARKER_ATTACHMENT_FILENAME_f3a1',
  attachmentBytes: 'MARKER_ATTACHMENT_BYTES_f3a1',
  tagName: 'MARKER_TAG_NAME_f3a1',
} as const;

beforeEach(() => {
  mockAsyncStorage.__reset();
  mockRNFS.__reset();
});

describe('no decrypted value is ever written to disk or a search index', () => {
  it('never appears in AsyncStorage after creating one entry of every type', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: MARKERS.wifiSsid,
      password: MARKERS.wifiPassword,
      notes: '',
    });
    await saveLicenseKey(vaultKey, {
      id: 'l1',
      productName: MARKERS.licenseProduct,
      key: MARKERS.licenseKey,
      purchaseNotes: '',
    });
    await saveRecoveryCodeEntry(vaultKey, {
      id: 'r1',
      serviceName: MARKERS.recoveryService,
      codes: [MARKERS.recoveryCode],
      notes: '',
    });
    await saveImportantNumber(vaultKey, {
      id: 'i1',
      label: MARKERS.numberLabel,
      value: MARKERS.numberValue,
    });
    await saveDeviceDetail(vaultKey, {
      id: 'd1',
      deviceName: MARKERS.deviceName,
      serialNumber: MARKERS.deviceSerial,
      specs: '',
      notes: '',
    });
    await saveSecureNote(vaultKey, {
      id: 'n1',
      title: MARKERS.noteTitle,
      body: MARKERS.noteBody,
    });
    await createTag(vaultKey, MARKERS.tagName);

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      for (const marker of Object.values(MARKERS)) {
        expect(raw).not.toContain(marker);
      }
    }
  });

  it('never appears in the attachment file on disk', async () => {
    const metadata = await addAttachment(vaultKey, {
      entryType: 'secureNotes',
      entryId: 'n1',
      fileName: MARKERS.attachmentFileName,
      mimeType: 'application/octet-stream',
      data: Buffer.from(MARKERS.attachmentBytes),
    });

    // The write call is the only place the sealed bytes ever reach RNFS —
    // inspect exactly what was written, not just re-read it back through
    // our own decrypt path (which would trivially "pass" this check).
    const writeCall = (RNFS.writeFile as jest.Mock).mock.calls.find(call =>
      call[0].includes(metadata.storageId),
    );
    expect(writeCall).toBeDefined();
    const [, writtenBase64] = writeCall as [string, string, string];
    const writtenBytes = Buffer.from(writtenBase64, 'base64').toString(
      'latin1',
    );
    expect(writtenBytes).not.toContain(MARKERS.attachmentBytes);

    // And the attachment's own metadata record (containing the filename)
    // must not appear in AsyncStorage either.
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain(MARKERS.attachmentFileName);
    }
  });

  it('never triggers an AsyncStorage write while building the search index', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: MARKERS.wifiSsid,
      password: MARKERS.wifiPassword,
      notes: '',
    });
    (AsyncStorage.setItem as jest.Mock).mockClear();

    const index = await buildSearchIndex(vaultKey);

    expect(index.some(entry => entry.title === MARKERS.wifiSsid)).toBe(true);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('never persists a decrypted value even when an entry is tagged', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: MARKERS.wifiSsid,
      password: MARKERS.wifiPassword,
      notes: '',
    });
    const tag = await createTag(vaultKey, MARKERS.tagName);
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain(MARKERS.wifiSsid);
      expect(raw).not.toContain(MARKERS.wifiPassword);
    }
  });
});
