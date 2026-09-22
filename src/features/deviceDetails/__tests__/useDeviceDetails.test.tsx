import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { useDeviceDetails } from '../useDeviceDetails';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderDeviceDetails() {
  return renderHook(() => useDeviceDetails(), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useDeviceDetails', () => {
  it('starts empty and not loading once refreshed', async () => {
    const { result } = await renderDeviceDetails();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toEqual([]);
  });

  it('creates an entry and reflects it in state immediately', async () => {
    const { result } = await renderDeviceDetails();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.create({
        deviceName: 'MacBook Pro',
        serialNumber: 'SN1',
        specs: 'M3',
        notes: '',
      });
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      deviceName: 'MacBook Pro',
    });
  });

  it('updates an entry', async () => {
    const { result } = await renderDeviceDetails();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        deviceName: 'MacBook Pro',
        serialNumber: 'SN1',
        specs: 'M3',
        notes: '',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.update({
        id: createdId,
        deviceName: 'MacBook Pro',
        serialNumber: 'SN1',
        specs: 'M3 Max',
        notes: 'updated',
      });
    });

    expect(result.current.entries[0]).toMatchObject({
      specs: 'M3 Max',
      notes: 'updated',
    });
  });

  it('removes an entry', async () => {
    const { result } = await renderDeviceDetails();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        deviceName: 'MacBook Pro',
        serialNumber: 'SN1',
        specs: '',
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
