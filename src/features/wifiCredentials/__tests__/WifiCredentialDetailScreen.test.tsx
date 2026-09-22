import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { WifiCredentialDetailScreen } from '../WifiCredentialDetailScreen';
import {
  listWifiCredentials,
  saveWifiCredential,
} from '../wifiCredentialRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);
let confirmDelete: (() => void) | undefined;

function renderDetailScreen(params: { id?: string }, goBack = jest.fn()) {
  const navigation = { navigate: jest.fn(), goBack } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <WifiCredentialDetailScreen
        navigation={navigation}
        route={{ params } as never}
      />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
  confirmDelete = undefined;
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    confirmDelete = buttons?.find(button => button.style === 'destructive')
      ?.onPress as (() => void) | undefined;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('WifiCredentialDetailScreen — create', () => {
  it('creates a new credential and goes back on save', async () => {
    const goBack = jest.fn();
    await renderDetailScreen({}, goBack);

    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Home Wi-Fi'),
        'OfficeWifi',
      ),
    );
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Password'),
        'super-secret',
      ),
    );

    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listWifiCredentials(vaultKey);
    expect(saved).toEqual([
      expect.objectContaining({
        ssid: 'OfficeWifi',
        password: 'super-secret',
        notes: '',
      }),
    ]);
  });
});

describe('WifiCredentialDetailScreen — view/edit an existing credential', () => {
  it('shows a masked password with the option to reveal it', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'correct-horse',
      notes: 'guest room',
    });

    await renderDetailScreen({ id: 'id-1' });
    await waitFor(() => expect(screen.getByText('HomeWifi')).toBeTruthy());

    expect(screen.queryByText('correct-horse')).toBeNull();
    await act(async () => fireEvent.press(screen.getByText('Reveal')));
    expect(screen.getByText('correct-horse')).toBeTruthy();
  });

  it('saves edits made after tapping Edit', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'correct-horse',
      notes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('HomeWifi')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Edit')));
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Password'),
        'new-password',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listWifiCredentials(vaultKey);
    expect(saved[0]).toMatchObject({ password: 'new-password' });
  });

  it('deletes the credential and goes back', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('HomeWifi')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));
    await act(async () => confirmDelete?.());

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(await listWifiCredentials(vaultKey)).toEqual([]);
  });

  it('does not delete the credential until the confirmation is accepted', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'id-1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('HomeWifi')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));

    expect(goBack).not.toHaveBeenCalled();
    expect(await listWifiCredentials(vaultKey)).toHaveLength(1);
  });
});
