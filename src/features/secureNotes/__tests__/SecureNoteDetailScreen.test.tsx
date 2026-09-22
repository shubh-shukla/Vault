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
import { SecureNoteDetailScreen } from '../SecureNoteDetailScreen';
import { listSecureNotes, saveSecureNote } from '../secureNoteRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);
let confirmDelete: (() => void) | undefined;

function renderDetailScreen(params: { id?: string }, goBack = jest.fn()) {
  const navigation = { navigate: jest.fn(), goBack } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <SecureNoteDetailScreen
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

describe('SecureNoteDetailScreen — create', () => {
  it('creates a new entry and goes back on save', async () => {
    const goBack = jest.fn();
    await renderDetailScreen({}, goBack);

    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('Title'), 'My Note'),
    );
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Note'),
        'note contents',
      ),
    );

    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listSecureNotes(vaultKey);
    expect(saved).toEqual([
      expect.objectContaining({ title: 'My Note', body: 'note contents' }),
    ]);
  });
});

describe('SecureNoteDetailScreen — view/edit an existing entry', () => {
  it('shows the title and body in plain text', async () => {
    await saveSecureNote(vaultKey, {
      id: 'id-1',
      title: 'My Note',
      body: 'note contents',
    });

    await renderDetailScreen({ id: 'id-1' });

    await waitFor(() => expect(screen.getByText('My Note')).toBeTruthy());
    expect(screen.getByText('note contents')).toBeTruthy();
  });

  it('saves edits made after tapping Edit', async () => {
    await saveSecureNote(vaultKey, {
      id: 'id-1',
      title: 'My Note',
      body: 'note contents',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('My Note')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Edit')));
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Note'),
        'updated contents',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listSecureNotes(vaultKey);
    expect(saved[0]).toMatchObject({ body: 'updated contents' });
  });

  it('deletes the entry and goes back', async () => {
    await saveSecureNote(vaultKey, {
      id: 'id-1',
      title: 'My Note',
      body: 'note contents',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('My Note')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));
    await act(async () => confirmDelete?.());

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(await listSecureNotes(vaultKey)).toEqual([]);
  });

  it('does not delete the entry until the confirmation is accepted', async () => {
    await saveSecureNote(vaultKey, {
      id: 'id-1',
      title: 'My Note',
      body: 'note contents',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('My Note')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));

    expect(goBack).not.toHaveBeenCalled();
    expect(await listSecureNotes(vaultKey)).toHaveLength(1);
  });
});
