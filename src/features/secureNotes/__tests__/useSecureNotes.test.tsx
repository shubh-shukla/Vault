import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { useSecureNotes } from '../useSecureNotes';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderSecureNotes() {
  return renderHook(() => useSecureNotes(), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useSecureNotes', () => {
  it('starts empty and not loading once refreshed', async () => {
    const { result } = await renderSecureNotes();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([]);
  });

  it('creates an entry and reflects it in state immediately', async () => {
    const { result } = await renderSecureNotes();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.create({ title: 'Note', body: 'body text' });
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      title: 'Note',
      body: 'body text',
    });
  });

  it('updates an entry', async () => {
    const { result } = await renderSecureNotes();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        title: 'Note',
        body: 'body text',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.update({
        id: createdId,
        title: 'Note',
        body: 'updated body',
      });
    });

    expect(result.current.entries[0]).toMatchObject({ body: 'updated body' });
  });

  it('removes an entry', async () => {
    const { result } = await renderSecureNotes();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        title: 'Note',
        body: 'body text',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.remove(createdId);
    });

    expect(result.current.entries).toEqual([]);
  });
});
