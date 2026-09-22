import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { DeviceDetailDetailScreen } from '../DeviceDetailDetailScreen';
import { listDeviceDetails, saveDeviceDetail } from '../deviceDetailRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderDetailScreen(params: { id?: string }, goBack = jest.fn()) {
  const navigation = { navigate: jest.fn(), goBack } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <DeviceDetailDetailScreen
        navigation={navigation}
        route={{ params } as never}
      />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('DeviceDetailDetailScreen — create', () => {
  it('creates a new entry and goes back on save', async () => {
    const goBack = jest.fn();
    await renderDetailScreen({}, goBack);

    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Device name'),
        'MacBook Pro',
      ),
    );
    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('Serial number'), 'SN1'),
    );

    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listDeviceDetails(vaultKey);
    expect(saved).toEqual([
      expect.objectContaining({
        deviceName: 'MacBook Pro',
        serialNumber: 'SN1',
      }),
    ]);
  });
});

describe('DeviceDetailDetailScreen — view/edit an existing entry', () => {
  it('shows all fields in plain text (no reveal control for this entry type)', async () => {
    await saveDeviceDetail(vaultKey, {
      id: 'id-1',
      deviceName: 'MacBook Pro',
      serialNumber: 'SN1',
      specs: 'M3 Max',
      notes: '',
    });

    await renderDetailScreen({ id: 'id-1' });
    await waitFor(() => expect(screen.getByText('MacBook Pro')).toBeTruthy());

    expect(screen.getByText('SN1')).toBeTruthy();
    expect(screen.getByText('M3 Max')).toBeTruthy();
    expect(screen.queryByText('Reveal')).toBeNull();
  });

  it('saves edits made after tapping Edit', async () => {
    await saveDeviceDetail(vaultKey, {
      id: 'id-1',
      deviceName: 'MacBook Pro',
      serialNumber: 'SN1',
      specs: '',
      notes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('MacBook Pro')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Edit')));
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Specs'),
        'M3 Max, 64GB',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listDeviceDetails(vaultKey);
    expect(saved[0]).toMatchObject({ specs: 'M3 Max, 64GB' });
  });

  it('deletes the entry and goes back', async () => {
    await saveDeviceDetail(vaultKey, {
      id: 'id-1',
      deviceName: 'MacBook Pro',
      serialNumber: 'SN1',
      specs: '',
      notes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('MacBook Pro')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(await listDeviceDetails(vaultKey)).toEqual([]);
  });
});
