import uuid from 'react-native-uuid';
import { decryptRecord, deriveSubkey, encryptRecord } from '@shared/crypto';
import {
  deleteEncryptedRecord,
  loadAllEncryptedRecords,
  saveEncryptedRecord,
} from '@shared/storage';
import type { Tag, TagAssignment } from './types';

const TAGS_COLLECTION = 'tags';
const ASSIGNMENTS_COLLECTION = 'tagAssignments';

function assignmentId(
  tagId: string,
  entryType: string,
  entryId: string,
): string {
  return `${tagId}:${entryType}:${entryId}`;
}

export async function listTags(vaultKey: Buffer): Promise<Tag[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(TAGS_COLLECTION);
  return records.map(({ envelope }) => decryptRecord<Tag>(envelope, fieldKey));
}

export async function createTag(vaultKey: Buffer, name: string): Promise<Tag> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const tag: Tag = { id: uuid.v4() as string, name };
  await saveEncryptedRecord(
    TAGS_COLLECTION,
    tag.id,
    encryptRecord(tag, fieldKey),
  );
  return tag;
}

export async function renameTag(vaultKey: Buffer, tag: Tag): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  await saveEncryptedRecord(
    TAGS_COLLECTION,
    tag.id,
    encryptRecord(tag, fieldKey),
  );
}

async function listAssignments(vaultKey: Buffer): Promise<TagAssignment[]> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const records = await loadAllEncryptedRecords(ASSIGNMENTS_COLLECTION);
  return records.map(({ envelope }) =>
    decryptRecord<TagAssignment>(envelope, fieldKey),
  );
}

export async function deleteTag(
  vaultKey: Buffer,
  tagId: string,
): Promise<void> {
  await deleteEncryptedRecord(TAGS_COLLECTION, tagId);

  const assignments = await listAssignments(vaultKey);
  await Promise.all(
    assignments
      .filter(assignment => assignment.tagId === tagId)
      .map(assignment =>
        deleteEncryptedRecord(ASSIGNMENTS_COLLECTION, assignment.id),
      ),
  );
}

export async function listTagsForEntry(
  vaultKey: Buffer,
  entryType: string,
  entryId: string,
): Promise<Tag[]> {
  const [tags, assignments] = await Promise.all([
    listTags(vaultKey),
    listAssignments(vaultKey),
  ]);
  const assignedTagIds = new Set(
    assignments
      .filter(
        assignment =>
          assignment.entryType === entryType && assignment.entryId === entryId,
      )
      .map(assignment => assignment.tagId),
  );
  return tags.filter(tag => assignedTagIds.has(tag.id));
}

export async function listEntryRefsForTag(
  vaultKey: Buffer,
  tagId: string,
): Promise<Array<{ entryType: string; entryId: string }>> {
  const assignments = await listAssignments(vaultKey);
  return assignments
    .filter(assignment => assignment.tagId === tagId)
    .map(({ entryType, entryId }) => ({ entryType, entryId }));
}

export async function assignTag(
  vaultKey: Buffer,
  tagId: string,
  entryType: string,
  entryId: string,
): Promise<void> {
  const fieldKey = deriveSubkey(vaultKey, 'field-encryption');
  const assignment: TagAssignment = {
    id: assignmentId(tagId, entryType, entryId),
    tagId,
    entryType,
    entryId,
  };
  await saveEncryptedRecord(
    ASSIGNMENTS_COLLECTION,
    assignment.id,
    encryptRecord(assignment, fieldKey),
  );
}

export async function unassignTag(
  tagId: string,
  entryType: string,
  entryId: string,
): Promise<void> {
  await deleteEncryptedRecord(
    ASSIGNMENTS_COLLECTION,
    assignmentId(tagId, entryType, entryId),
  );
}
