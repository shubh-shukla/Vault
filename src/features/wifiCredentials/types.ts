export interface WifiCredential {
  id: string;
  ssid: string;
  password: string;
  notes: string;
}

export type WifiCredentialInput = Omit<WifiCredential, 'id'>;
