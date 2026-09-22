import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { SecureNotesListScreen } from '../SecureNotesListScreen';
import { saveSecureNote } from '../secureNoteRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderListScreen(navigate = jest.fn()) {
  const navigation = { navigate, setOptions: jest.fn() } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <SecureNotesListScreen navigation={navigation} route={{} as never} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('SecureNotesListScreen', () => {
  it('shows an empty state when there are no entries', async () => {
    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('No secure notes yet.')).toBeTruthy(),
    );
  });

  it('lists saved entries by title', async () => {
    await saveSecureNote(vaultKey, {
      id: 'id-1',
      title: 'Safe combination',
      body: 'body',
    });

    await renderListScreen();

    await waitFor(() =>
      expect(screen.getByText('Safe combination')).toBeTruthy(),
    );
  });

  it('falls back to "Untitled note" when the title is empty', async () => {
    await saveSecureNote(vaultKey, { id: 'id-1', title: '', body: 'body' });

    await renderListScreen();

    await waitFor(() => expect(screen.getByText('Untitled note')).toBeTruthy());
  });

  it('navigates to the detail screen with the entry id when a row is pressed', async () => {
    await saveSecureNote(vaultKey, {
      id: 'id-1',
      title: 'Safe combination',
      body: 'body',
    });
    const navigate = jest.fn();
    await renderListScreen(navigate);

    await waitFor(() => screen.getByText('Safe combination'));
    fireEvent.press(screen.getByText('Safe combination'));

    expect(navigate).toHaveBeenCalledWith('SecureNoteDetail', { id: 'id-1' });
  });
});
