import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { saveWifiCredential } from '@features/wifiCredentials';
import { saveSecureNote } from '@features/secureNotes';
import { useVaultSearch } from '../useVaultSearch';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderVaultSearch() {
  return renderHook(() => useVaultSearch(), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useVaultSearch', () => {
  it('indexes on mount and starts with no results for an empty query', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });

    const { result } = await renderVaultSearch();

    await waitFor(() => expect(result.current.isIndexing).toBe(false));
    expect(result.current.results).toEqual([]);
  });

  it('returns matching results once a query is set', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    await saveSecureNote(vaultKey, {
      id: 'n1',
      title: 'Grocery list',
      body: 'milk, eggs',
    });

    const { result } = await renderVaultSearch();
    await waitFor(() => expect(result.current.isIndexing).toBe(false));

    await act(async () => result.current.setQuery('wifi'));

    expect(result.current.results).toEqual([
      {
        entryType: 'wifiCredentials',
        entryId: 'w1',
        title: 'HomeWifi',
        subtitle: 'Wi-Fi credential',
      },
    ]);
  });

  it('clearing the query clears the results', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });

    const { result } = await renderVaultSearch();
    await waitFor(() => expect(result.current.isIndexing).toBe(false));

    await act(async () => result.current.setQuery('wifi'));
    expect(result.current.results).toHaveLength(1);

    await act(async () => result.current.setQuery(''));
    expect(result.current.results).toEqual([]);
  });
});
