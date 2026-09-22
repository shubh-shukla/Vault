import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { useImportantNumbers } from '../useImportantNumbers';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderImportantNumbers() {
  return renderHook(() => useImportantNumbers(), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useImportantNumbers', () => {
  it('starts empty and not loading once refreshed', async () => {
    const { result } = await renderImportantNumbers();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([]);
  });

  it('creates an entry and reflects it in state immediately', async () => {
    const { result } = await renderImportantNumbers();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.create({ label: 'PIN', value: '1234' });
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      label: 'PIN',
      value: '1234',
    });
  });

  it('updates an entry', async () => {
    const { result } = await renderImportantNumbers();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        label: 'PIN',
        value: '1234',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.update({
        id: createdId,
        label: 'PIN',
        value: '5678',
      });
    });

    expect(result.current.entries[0]).toMatchObject({ value: '5678' });
  });

  it('removes an entry', async () => {
    const { result } = await renderImportantNumbers();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        label: 'PIN',
        value: '1234',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.remove(createdId);
    });

    expect(result.current.entries).toEqual([]);
  });
});
