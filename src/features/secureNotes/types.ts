export interface SecureNoteEntry {
  id: string;
  title: string;
  body: string;
}

export type SecureNoteEntryInput = Omit<SecureNoteEntry, 'id'>;
