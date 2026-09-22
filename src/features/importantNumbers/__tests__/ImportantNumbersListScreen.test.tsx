import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { ImportantNumbersListScreen } from '../ImportantNumbersListScreen';
import { saveImportantNumber } from '../importantNumberRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderListScreen(navigate = jest.fn()) {
  const navigation = { navigate, setOptions: jest.fn() } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <ImportantNumbersListScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('ImportantNumbersListScreen', () => {
  it('shows an empty state when there are no entries', async () => {
    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('No important numbers yet.')).toBeTruthy(),
    );
  });

  it('lists saved entries by label', async () => {
    await saveImportantNumber(vaultKey, {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    });

    await renderListScreen();

    await waitFor(() => expect(screen.getByText('PIN')).toBeTruthy());
  });

  it('navigates to the detail screen with the entry id when a row is pressed', async () => {
    await saveImportantNumber(vaultKey, {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    });
    const navigate = jest.fn();
    await renderListScreen(navigate);

    await waitFor(() => screen.getByText('PIN'));
    fireEvent.press(screen.getByText('PIN'));

    expect(navigate).toHaveBeenCalledWith('ImportantNumberDetail', {
      id: 'id-1',
    });
  });
});
