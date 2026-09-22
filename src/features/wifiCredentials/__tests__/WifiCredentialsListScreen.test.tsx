import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { WifiCredentialsListScreen } from '../WifiCredentialsListScreen';
import { saveWifiCredential } from '../wifiCredentialRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderListScreen(navigate = jest.fn()) {
  const navigation = { navigate, setOptions: jest.fn() } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <WifiCredentialsListScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('WifiCredentialsListScreen', () => {
  it('shows an empty state when there are no credentials', async () => {
    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('No Wi-Fi credentials yet.')).toBeTruthy(),
    );
  });

  it('lists saved credentials by SSID', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });

    await renderListScreen();

    await waitFor(() => expect(screen.getByText('HomeWifi')).toBeTruthy());
  });

  it('navigates to the detail screen with the credential id when a row is pressed', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    const navigate = jest.fn();
    await renderListScreen(navigate);

    await waitFor(() => screen.getByText('HomeWifi'));
    fireEvent.press(screen.getByText('HomeWifi'));

    expect(navigate).toHaveBeenCalledWith('WifiCredentialDetail', {
      id: 'id-1',
    });
  });
});
