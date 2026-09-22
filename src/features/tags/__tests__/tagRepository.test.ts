import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  assignTag,
  createTag,
  deleteTag,
  listEntryRefsForTag,
  listTags,
  listTagsForEntry,
  renameTag,
  unassignTag,
} from '../tagRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 42);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('tagRepository', () => {
  it('creates and lists tags', async () => {
    await createTag(vaultKey, 'Work');
    await createTag(vaultKey, 'Home');

    const tags = await listTags(vaultKey);
    expect(tags.map(tag => tag.name).sort()).toEqual(['Home', 'Work']);
  });

  it('never persists a plaintext tag name to disk', async () => {
    await createTag(vaultKey, 'Top Secret Project');

    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toContain('Top Secret Project');
    }
  });

  it('renames a tag', async () => {
    const tag = await createTag(vaultKey, 'Work');
    await renameTag(vaultKey, { ...tag, name: 'Office' });

    const tags = await listTags(vaultKey);
    expect(tags).toEqual([{ id: tag.id, name: 'Office' }]);
  });

  it('assigns a tag to an entry and lists it back', async () => {
    const tag = await createTag(vaultKey, 'Work');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');

    expect(await listTagsForEntry(vaultKey, 'wifiCredentials', 'w1')).toEqual([
      tag,
    ]);
    expect(await listTagsForEntry(vaultKey, 'wifiCredentials', 'w2')).toEqual(
      [],
    );
  });

  it('assigning the same tag twice does not duplicate it', async () => {
    const tag = await createTag(vaultKey, 'Work');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');

    expect(await listTagsForEntry(vaultKey, 'wifiCredentials', 'w1')).toEqual([
      tag,
    ]);
  });

  it('unassigns a tag from an entry', async () => {
    const tag = await createTag(vaultKey, 'Work');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');
    await unassignTag(tag.id, 'wifiCredentials', 'w1');

    expect(await listTagsForEntry(vaultKey, 'wifiCredentials', 'w1')).toEqual(
      [],
    );
  });

  it('lists every entry ref assigned to a tag, across entry types', async () => {
    const tag = await createTag(vaultKey, 'Work');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');
    await assignTag(vaultKey, tag.id, 'secureNotes', 'n1');

    const refs = await listEntryRefsForTag(vaultKey, tag.id);
    expect(refs).toEqual(
      expect.arrayContaining([
        { entryType: 'wifiCredentials', entryId: 'w1' },
        { entryType: 'secureNotes', entryId: 'n1' },
      ]),
    );
  });

  it('deleting a tag also removes every assignment referencing it', async () => {
    const tag = await createTag(vaultKey, 'Work');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');

    await deleteTag(vaultKey, tag.id);

    expect(await listTags(vaultKey)).toEqual([]);
    expect(await listTagsForEntry(vaultKey, 'wifiCredentials', 'w1')).toEqual(
      [],
    );
  });
});
