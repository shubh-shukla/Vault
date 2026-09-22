export interface DeviceDetailEntry {
  id: string;
  deviceName: string;
  serialNumber: string;
  specs: string;
  notes: string;
}

export type DeviceDetailEntryInput = Omit<DeviceDetailEntry, 'id'>;
