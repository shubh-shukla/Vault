import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { LicenseKeysListScreen } from '../LicenseKeysListScreen';
import { saveLicenseKey } from '../licenseKeyRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderListScreen(navigate = jest.fn()) {
  const navigation = { navigate, setOptions: jest.fn() } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <LicenseKeysListScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('LicenseKeysListScreen', () => {
  it('shows an empty state when there are no license keys', async () => {
    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('No license keys yet.')).toBeTruthy(),
    );
  });

  it('lists saved license keys by product name', async () => {
    await saveLicenseKey(vaultKey, {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'XXXX',
      purchaseNotes: '',
    });

    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('Photo Editor Pro')).toBeTruthy(),
    );
  });

  it('navigates to the detail screen with the license key id when a row is pressed', async () => {
    await saveLicenseKey(vaultKey, {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'XXXX',
      purchaseNotes: '',
    });
    const navigate = jest.fn();
    await renderListScreen(navigate);

    await waitFor(() => screen.getByText('Photo Editor Pro'));
    fireEvent.press(screen.getByText('Photo Editor Pro'));

    expect(navigate).toHaveBeenCalledWith('LicenseKeyDetail', { id: 'id-1' });
  });
});
