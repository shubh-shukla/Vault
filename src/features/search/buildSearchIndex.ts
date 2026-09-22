import { listWifiCredentials } from '@features/wifiCredentials';
import { listLicenseKeys } from '@features/licenseKeys';
import { listRecoveryCodeEntries } from '@features/recoveryCodes';
import { listImportantNumbers } from '@features/importantNumbers';
import { listDeviceDetails } from '@features/deviceDetails';
import { listSecureNotes } from '@features/secureNotes';
import type { SearchableEntry } from './types';

export async function buildSearchIndex(
  vaultKey: Buffer,
): Promise<SearchableEntry[]> {
  const [wifi, licenses, recoveryCodes, importantNumbers, devices, notes] =
    await Promise.all([
      listWifiCredentials(vaultKey),
      listLicenseKeys(vaultKey),
      listRecoveryCodeEntries(vaultKey),
      listImportantNumbers(vaultKey),
      listDeviceDetails(vaultKey),
      listSecureNotes(vaultKey),
    ]);

  return [
    ...wifi.map(
      (entry): SearchableEntry => ({
        entryType: 'wifiCredentials',
        entryId: entry.id,
        title: entry.ssid,
        subtitle: 'Wi-Fi credential',
      }),
    ),
    ...licenses.map(
      (entry): SearchableEntry => ({
        entryType: 'licenseKeys',
        entryId: entry.id,
        title: entry.productName,
        subtitle: 'License key',
      }),
    ),
    ...recoveryCodes.map(
      (entry): SearchableEntry => ({
        entryType: 'recoveryCodes',
        entryId: entry.id,
        title: entry.serviceName,
        subtitle: 'Recovery codes',
      }),
    ),
    ...importantNumbers.map(
      (entry): SearchableEntry => ({
        entryType: 'importantNumbers',
        entryId: entry.id,
        title: entry.label,
        subtitle: 'Important number',
      }),
    ),
    ...devices.map(
      (entry): SearchableEntry => ({
        entryType: 'deviceDetails',
        entryId: entry.id,
        title: entry.deviceName,
        subtitle: 'Device',
      }),
    ),
    ...notes.map(
      (entry): SearchableEntry => ({
        entryType: 'secureNotes',
        entryId: entry.id,
        title: entry.title || 'Untitled note',
        subtitle: 'Secure note',
      }),
    ),
  ];
}
