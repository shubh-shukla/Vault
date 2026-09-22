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
import { HomeScreen } from '../HomeScreen';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderHomeScreen(navigate = jest.fn()) {
  const navigation = { navigate, setOptions: jest.fn() } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <HomeScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('HomeScreen', () => {
  it('shows an item count per category that updates once entries load', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });

    await renderHomeScreen();

    await waitFor(() => expect(screen.getByText('1')).toBeTruthy());
  });

  it('navigates to a category list when its row is pressed', async () => {
    const navigate = jest.fn();
    await renderHomeScreen(navigate);

    await act(async () =>
      fireEvent.press(screen.getByText('Wi-Fi Credentials')),
    );

    expect(navigate).toHaveBeenCalledWith('WifiCredentialsList');
  });

  it('navigates to Backup when the utility row is pressed', async () => {
    const navigate = jest.fn();
    await renderHomeScreen(navigate);

    await act(async () => fireEvent.press(screen.getByText('Backup')));

    expect(navigate).toHaveBeenCalledWith('Backup');
  });
});
