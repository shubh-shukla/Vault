export interface AttachmentMetadata {
  id: string;
  entryType: string;
  entryId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageId: string;
}

export type AttachmentInput = {
  entryType: string;
  entryId: string;
  fileName: string;
  mimeType: string;
  data: Buffer;
};
