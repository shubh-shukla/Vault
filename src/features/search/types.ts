export type SearchableEntryType =
  | 'wifiCredentials'
  | 'licenseKeys'
  | 'recoveryCodes'
  | 'importantNumbers'
  | 'deviceDetails'
  | 'secureNotes';

export interface SearchableEntry {
  entryType: SearchableEntryType;
  entryId: string;
  title: string;
  subtitle: string;
}
