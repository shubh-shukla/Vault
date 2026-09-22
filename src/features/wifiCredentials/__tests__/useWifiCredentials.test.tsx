import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { useWifiCredentials } from '../useWifiCredentials';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderWifiCredentials() {
  return renderHook(() => useWifiCredentials(), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useWifiCredentials', () => {
  it('starts empty and not loading once refreshed', async () => {
    const { result } = await renderWifiCredentials();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.credentials).toEqual([]);
  });

  it('creates a credential and reflects it in state immediately', async () => {
    const { result } = await renderWifiCredentials();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.create({
        ssid: 'HomeWifi',
        password: 'pw',
        notes: '',
      });
    });

    expect(result.current.credentials).toHaveLength(1);
    expect(result.current.credentials[0]).toMatchObject({
      ssid: 'HomeWifi',
      password: 'pw',
    });
  });

  it('updates a credential', async () => {
    const { result } = await renderWifiCredentials();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        ssid: 'HomeWifi',
        password: 'pw',
        notes: '',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.update({
        id: createdId,
        ssid: 'HomeWifi',
        password: 'new-password',
        notes: 'updated',
      });
    });

    expect(result.current.credentials[0]).toMatchObject({
      password: 'new-password',
      notes: 'updated',
    });
  });

  it('removes a credential', async () => {
    const { result } = await renderWifiCredentials();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        ssid: 'HomeWifi',
        password: 'pw',
        notes: '',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.remove(createdId);
    });

    expect(result.current.credentials).toEqual([]);
  });
});
