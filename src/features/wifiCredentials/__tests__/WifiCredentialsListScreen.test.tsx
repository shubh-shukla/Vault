import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { assignTag, createTag } from '@features/tags';
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

  it('filters the list to only credentials assigned the selected tag', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    await saveWifiCredential(vaultKey, {
      id: 'id-2',
      ssid: 'OfficeWifi',
      password: 'pw',
      notes: '',
    });
    const tag = await createTag(vaultKey, 'Work');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'id-2');

    await renderListScreen();
    await waitFor(() => expect(screen.getByText('HomeWifi')).toBeTruthy());
    expect(screen.getByText('OfficeWifi')).toBeTruthy();

    await act(async () => fireEvent.press(screen.getByText('Work')));

    await waitFor(() => expect(screen.queryByText('HomeWifi')).toBeNull());
    expect(screen.getByText('OfficeWifi')).toBeTruthy();

    await act(async () => fireEvent.press(screen.getByText('All')));
    await waitFor(() => expect(screen.getByText('HomeWifi')).toBeTruthy());
  });
});
