import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EncryptedEnvelope } from '@shared/crypto';

function manifestKey(collection: string): string {
  return `vault/${collection}/__manifest__`;
}

function recordKey(collection: string, id: string): string {
  return `vault/${collection}/${id}`;
}

async function readManifest(collection: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(manifestKey(collection));
  return raw ? (JSON.parse(raw) as string[]) : [];
}

async function writeManifest(collection: string, ids: string[]): Promise<void> {
  await AsyncStorage.setItem(manifestKey(collection), JSON.stringify(ids));
}

export async function listRecordIds(collection: string): Promise<string[]> {
  return readManifest(collection);
}

export async function saveEncryptedRecord(
  collection: string,
  id: string,
  envelope: EncryptedEnvelope,
): Promise<void> {
  await AsyncStorage.setItem(
    recordKey(collection, id),
    JSON.stringify(envelope),
  );

  const ids = await readManifest(collection);
  if (!ids.includes(id)) {
    await writeManifest(collection, [...ids, id]);
  }
}

export async function loadEncryptedRecord(
  collection: string,
  id: string,
): Promise<EncryptedEnvelope | null> {
  const raw = await AsyncStorage.getItem(recordKey(collection, id));
  return raw ? (JSON.parse(raw) as EncryptedEnvelope) : null;
}

export async function loadAllEncryptedRecords(
  collection: string,
): Promise<Array<{ id: string; envelope: EncryptedEnvelope }>> {
  const ids = await readManifest(collection);
  const keyed = await AsyncStorage.getMany(
    ids.map(id => recordKey(collection, id)),
  );

  return ids.flatMap(id => {
    const raw = keyed[recordKey(collection, id)];
    return raw ? [{ id, envelope: JSON.parse(raw) as EncryptedEnvelope }] : [];
  });
}

export async function deleteEncryptedRecord(
  collection: string,
  id: string,
): Promise<void> {
  await AsyncStorage.removeItem(recordKey(collection, id));

  const ids = await readManifest(collection);
  await writeManifest(
    collection,
    ids.filter(existingId => existingId !== id),
  );
}
