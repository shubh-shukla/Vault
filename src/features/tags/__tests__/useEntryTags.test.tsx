import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { createTag } from '../tagRepository';
import { useEntryTags } from '../useEntryTags';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderEntryTags(entryType: string, entryId: string) {
  return renderHook(() => useEntryTags(entryType, entryId), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useEntryTags', () => {
  it('starts empty for an entry with no tags', async () => {
    const { result } = await renderEntryTags('wifiCredentials', 'w1');

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tags).toEqual([]);
  });

  it('assigning a tag reflects it in state', async () => {
    const tag = await createTag(vaultKey, 'Work');
    const { result } = await renderEntryTags('wifiCredentials', 'w1');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.assign(tag.id));

    expect(result.current.tags).toEqual([tag]);
  });

  it('unassigning a tag removes it from state', async () => {
    const tag = await createTag(vaultKey, 'Work');
    const { result } = await renderEntryTags('wifiCredentials', 'w1');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => result.current.assign(tag.id));
    await act(async () => result.current.unassign(tag.id));

    expect(result.current.tags).toEqual([]);
  });
});
