export interface LicenseKey {
  id: string;
  productName: string;
  key: string;
  purchaseNotes: string;
}

export type LicenseKeyInput = Omit<LicenseKey, 'id'>;
