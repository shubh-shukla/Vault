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
import { ImportantNumberDetailScreen } from '../ImportantNumberDetailScreen';
import {
  listImportantNumbers,
  saveImportantNumber,
} from '../importantNumberRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);
let confirmDelete: (() => void) | undefined;

function renderDetailScreen(params: { id?: string }, goBack = jest.fn()) {
  const navigation = { navigate: jest.fn(), goBack } as never;
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <ImportantNumberDetailScreen
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

describe('ImportantNumberDetailScreen — create', () => {
  it('creates a new entry and goes back on save', async () => {
    const goBack = jest.fn();
    await renderDetailScreen({}, goBack);

    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('Label'), 'PIN'),
    );
    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('Value'), '1234'),
    );

    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listImportantNumbers(vaultKey);
    expect(saved).toEqual([
      expect.objectContaining({ label: 'PIN', value: '1234' }),
    ]);
  });
});

describe('ImportantNumberDetailScreen — view/edit an existing entry', () => {
  it('shows a masked value with the option to reveal it', async () => {
    await saveImportantNumber(vaultKey, {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    });

    await renderDetailScreen({ id: 'id-1' });
    await waitFor(() => expect(screen.getByText('PIN')).toBeTruthy());

    expect(screen.queryByText('1234')).toBeNull();
    await act(async () => fireEvent.press(screen.getByText('Reveal')));
    expect(screen.getByText('1234')).toBeTruthy();
  });

  it('saves edits made after tapping Edit', async () => {
    await saveImportantNumber(vaultKey, {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('PIN')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Edit')));
    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('Value'), '5678'),
    );
    await act(async () => fireEvent.press(screen.getByText('Save')));

    expect(goBack).toHaveBeenCalledTimes(1);
    const saved = await listImportantNumbers(vaultKey);
    expect(saved[0]).toMatchObject({ value: '5678' });
  });

  it('deletes the entry and goes back', async () => {
    await saveImportantNumber(vaultKey, {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('PIN')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));
    await act(async () => confirmDelete?.());

    expect(goBack).toHaveBeenCalledTimes(1);
    expect(await listImportantNumbers(vaultKey)).toEqual([]);
  });

  it('does not delete the entry until the confirmation is accepted', async () => {
    await saveImportantNumber(vaultKey, {
      id: 'id-1',
      label: 'PIN',
      value: '1234',
    });

    const goBack = jest.fn();
    await renderDetailScreen({ id: 'id-1' }, goBack);
    await waitFor(() => expect(screen.getByText('PIN')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Delete')));

    expect(goBack).not.toHaveBeenCalled();
    expect(await listImportantNumbers(vaultKey)).toHaveLength(1);
  });
});
