export interface RecoveryCodeEntry {
  id: string;
  serviceName: string;
  codes: string[];
  notes: string;
}

export type RecoveryCodeEntryInput = Omit<RecoveryCodeEntry, 'id'>;
