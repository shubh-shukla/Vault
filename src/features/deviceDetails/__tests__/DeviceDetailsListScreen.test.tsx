import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { DeviceDetailsListScreen } from '../DeviceDetailsListScreen';
import { saveDeviceDetail } from '../deviceDetailRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderListScreen(navigate = jest.fn()) {
  const navigation = { navigate, setOptions: jest.fn() } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <DeviceDetailsListScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('DeviceDetailsListScreen', () => {
  it('shows an empty state when there are no entries', async () => {
    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('No devices yet.')).toBeTruthy(),
    );
  });

  it('lists saved entries by device name', async () => {
    await saveDeviceDetail(vaultKey, {
      id: 'id-1',
      deviceName: 'MacBook Pro',
      serialNumber: 'SN1',
      specs: '',
      notes: '',
    });

    await renderListScreen();

    await waitFor(() => expect(screen.getByText('MacBook Pro')).toBeTruthy());
  });

  it('navigates to the detail screen with the entry id when a row is pressed', async () => {
    await saveDeviceDetail(vaultKey, {
      id: 'id-1',
      deviceName: 'MacBook Pro',
      serialNumber: 'SN1',
      specs: '',
      notes: '',
    });
    const navigate = jest.fn();
    await renderListScreen(navigate);

    await waitFor(() => screen.getByText('MacBook Pro'));
    fireEvent.press(screen.getByText('MacBook Pro'));

    expect(navigate).toHaveBeenCalledWith('DeviceDetailDetail', { id: 'id-1' });
  });
});
