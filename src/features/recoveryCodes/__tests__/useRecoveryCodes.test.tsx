import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { useRecoveryCodes } from '../useRecoveryCodes';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderRecoveryCodes() {
  return renderHook(() => useRecoveryCodes(), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useRecoveryCodes', () => {
  it('starts empty and not loading once refreshed', async () => {
    const { result } = await renderRecoveryCodes();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([]);
  });

  it('creates an entry with multiple codes and reflects it in state immediately', async () => {
    const { result } = await renderRecoveryCodes();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.create({
        serviceName: 'GitHub',
        codes: ['aaaa-1111', 'bbbb-2222'],
        notes: '',
      });
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      serviceName: 'GitHub',
      codes: ['aaaa-1111', 'bbbb-2222'],
    });
  });

  it('updates an entry', async () => {
    const { result } = await renderRecoveryCodes();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        serviceName: 'GitHub',
        codes: ['aaaa-1111'],
        notes: '',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.update({
        id: createdId,
        serviceName: 'GitHub',
        codes: ['aaaa-1111', 'new-code'],
        notes: 'updated',
      });
    });

    expect(result.current.entries[0]).toMatchObject({
      codes: ['aaaa-1111', 'new-code'],
      notes: 'updated',
    });
  });

  it('removes an entry', async () => {
    const { result } = await renderRecoveryCodes();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        serviceName: 'GitHub',
        codes: ['aaaa-1111'],
        notes: '',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.remove(createdId);
    });

    expect(result.current.entries).toEqual([]);
  });
});
