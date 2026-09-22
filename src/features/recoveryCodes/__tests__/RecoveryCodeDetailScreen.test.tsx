import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { RecoveryCodeDetailScreen } from '../RecoveryCodeDetailScreen';
import {
  listRecoveryCodeEntries,
  saveRecoveryCodeEntry,
} from '../recoveryCodeRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderDetailScreen(params: { id?: string }, goBack = jest.fn()) {
  const navigation = { navigate: jest.fn(), goBack } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <RecoveryCodeDetailScreen
        navigation={navigation}
        route={{ params } as never}
      />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('RecoveryCodeDetailScreen — create', () => {
  it('splits the multi-line codes field into an array and goes back on save', async () => {
    const goBack = jest.fn();
    await renderDetailScreen({}, goBack);

    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Service name'),
        'GitHub',
      ),
    );
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Recovery codes'),
        'aaaa-1111\nbbbb-2222\n',
      ),
    );

    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listRecoveryCodeEntries(vaultKey);
    expect(saved).toEqual([
      expect.objectContaining({
        serviceName: 'GitHub',
        codes: ['aaaa-1111', 'bbbb-2222'],
      }),
    ]);
  });
});

describe('RecoveryCodeDetailScreen — view/edit an existing entry', () => {
  it('shows masked codes with the option to reveal all of them', async () => {
    await saveRecoveryCodeEntry(vaultKey, {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['aaaa-1111', 'bbbb-2222'],
      notes: '',
    });

    await renderDetailScreen({ id: 'id-1' });
    await waitFor(() => expect(screen.getByText('GitHub')).toBeTruthy());

    expect(screen.queryByText('aaaa-1111\nbbbb-2222')).toBeNull();
    await act(async () => fireEvent.press(screen.getByText('Reveal')));
    expect(screen.getByText('aaaa-1111\nbbbb-2222')).toBeTruthy();
  });

  it('saves edits made after tapping Edit', async () => {
    await saveRecoveryCodeEntry(vaultKey, {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['aaaa-1111'],
      notes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('GitHub')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Edit')));
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Recovery codes'),
        'aaaa-1111\nnew-code',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listRecoveryCodeEntries(vaultKey);
    expect(saved[0]).toMatchObject({ codes: ['aaaa-1111', 'new-code'] });
  });

  it('deletes the entry and goes back', async () => {
    await saveRecoveryCodeEntry(vaultKey, {
      id: 'id-1',
      serviceName: 'GitHub',
      codes: ['aaaa-1111'],
      notes: '',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('GitHub')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(await listRecoveryCodeEntries(vaultKey)).toEqual([]);
  });
});
