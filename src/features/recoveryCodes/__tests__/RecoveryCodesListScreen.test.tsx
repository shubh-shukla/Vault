import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { RecoveryCodesListScreen } from '../RecoveryCodesListScreen';
import { saveRecoveryCodeEntry } from '../recoveryCodeRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderListScreen(navigate = jest.fn()) {
  const navigation = { navigate, setOptions: jest.fn() } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <RecoveryCodesListScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('RecoveryCodesListScreen', () => {
  it('shows an empty state when there are no entries', async () => {
    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('No recovery codes yet.')).toBeTruthy(),
    );
  });

  it('lists saved entries by service name with a code count', async () => {
    await saveRecoveryCodeEntry(vaultKey, {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['a', 'b', 'c'],
      notes: '',
    });

    await renderListScreen();

    await waitFor(() => expect(screen.getByText('GitHub')).toBeTruthy());
    expect(screen.getByText('3 codes')).toBeTruthy();
  });

  it('navigates to the detail screen with the entry id when a row is pressed', async () => {
    await saveRecoveryCodeEntry(vaultKey, {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['a'],
      notes: '',
    });
    const navigate = jest.fn();
    await renderListScreen(navigate);

    await waitFor(() => screen.getByText('GitHub'));
    fireEvent.press(screen.getByText('GitHub'));

    expect(navigate).toHaveBeenCalledWith('RecoveryCodeDetail', { id: 'id-1' });
  });
});
