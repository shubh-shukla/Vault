import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { saveWifiCredential } from '@features/wifiCredentials';
import { SearchScreen } from '../SearchScreen';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderSearchScreen(navigate = jest.fn()) {
  const navigation = { navigate } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <SearchScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('SearchScreen', () => {
  it('shows "No matches." for a query that matches nothing', async () => {
    await renderSearchScreen();
    await waitFor(() => expect(screen.queryByText('Indexing…')).toBeNull());

    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Search'),
        'nonexistent',
      ),
    );

    expect(screen.getByText('No matches.')).toBeTruthy();
  });

  it('shows matching results and navigates to the right detail route on press', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    const navigate = jest.fn();
    await renderSearchScreen(navigate);
    await waitFor(() => expect(screen.queryByText('Indexing…')).toBeNull());

    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('Search'), 'wifi'),
    );

    expect(screen.getByText('HomeWifi')).toBeTruthy();
    fireEvent.press(screen.getByText('HomeWifi'));

    expect(navigate).toHaveBeenCalledWith('WifiCredentialDetail', { id: 'w1' });
  });
});
