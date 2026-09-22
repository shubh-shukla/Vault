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
import { LicenseKeyDetailScreen } from '../LicenseKeyDetailScreen';
import { listLicenseKeys, saveLicenseKey } from '../licenseKeyRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);
let confirmDelete: (() => void) | undefined;

function renderDetailScreen(params: { id?: string }, goBack = jest.fn()) {
  const navigation = { navigate: jest.fn(), goBack } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <LicenseKeyDetailScreen
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

describe('LicenseKeyDetailScreen — create', () => {
  it('creates a new license key and goes back on save', async () => {
    const goBack = jest.fn();
    await renderDetailScreen({}, goBack);

    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Product name'),
        'Photo Editor Pro',
      ),
    );
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('License key'),
        'XXXX-YYYY',
      ),
    );

    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listLicenseKeys(vaultKey);
    expect(saved).toEqual([
      expect.objectContaining({
        productName: 'Photo Editor Pro',
        key: 'XXXX-YYYY',
        purchaseNotes: '',
      }),
    ]);
  });
});

describe('LicenseKeyDetailScreen — view/edit an existing license key', () => {
  it('shows a masked license key with the option to reveal it', async () => {
    await saveLicenseKey(vaultKey, {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'XXXX-YYYY',
      purchaseNotes: 'from the App Store',
    });

    await renderDetailScreen({ id: 'id-1' });
    await waitFor(() =>
      expect(screen.getByText('Photo Editor Pro')).toBeTruthy(),
    );

    expect(screen.queryByText('XXXX-YYYY')).toBeNull();
    await act(async () => fireEvent.press(screen.getByText('Reveal')));
    expect(screen.getByText('XXXX-YYYY')).toBeTruthy();
  });

  it('saves edits made after tapping Edit', async () => {
    await saveLicenseKey(vaultKey, {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'XXXX-YYYY',
      purchaseNotes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() =>
      expect(screen.getByText('Photo Editor Pro')).toBeTruthy(),
    );

    await act(async () => fireEvent.press(screen.getByText('Edit')));
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('License key'),
        'NEW-KEY',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listLicenseKeys(vaultKey);
    expect(saved[0]).toMatchObject({ key: 'NEW-KEY' });
  });

  it('deletes the license key and goes back', async () => {
    await saveLicenseKey(vaultKey, {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'key',
      purchaseNotes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() =>
      expect(screen.getByText('Photo Editor Pro')).toBeTruthy(),
    );

    await act(async () => fireEvent.press(screen.getByText('Delete')));
    await act(async () => confirmDelete?.());

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(await listLicenseKeys(vaultKey)).toEqual([]);
  });

  it('does not delete the license key until the confirmation is accepted', async () => {
    await saveLicenseKey(vaultKey, {
      id: 'id-1',
      productName: 'Photo Editor Pro',
      key: 'key',
      purchaseNotes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() =>
      expect(screen.getByText('Photo Editor Pro')).toBeTruthy(),
    );

    await act(async () => fireEvent.press(screen.getByText('Delete')));

    expect(goBack).not.toHaveBeenCalled();
    expect(await listLicenseKeys(vaultKey)).toHaveLength(1);
  });
});
