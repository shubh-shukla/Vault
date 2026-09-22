export interface ImportantNumberEntry {
  id: string;
  label: string;
  value: string;
}

export type ImportantNumberEntryInput = Omit<ImportantNumberEntry, 'id'>;
