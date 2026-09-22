import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { TagsSection } from '../TagsSection';
import { assignTag, createTag, listTagsForEntry } from '../tagRepository';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

function renderSection(entryId = 'w1') {
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <TagsSection entryType="wifiCredentials" entryId={entryId} />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
});

describe('TagsSection', () => {
  it('creates a new tag and assigns it when typed and submitted', async () => {
    await renderSection();

    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('New tag'), 'Work'),
    );
    await act(async () => fireEvent.press(screen.getByText('Add')));

    await waitFor(() => expect(screen.getByText('Work ×')).toBeTruthy());
    expect(
      await listTagsForEntry(vaultKey, 'wifiCredentials', 'w1'),
    ).toHaveLength(1);
  });

  it('offers an existing unassigned tag as a quick-select chip', async () => {
    await createTag(vaultKey, 'Home');

    await renderSection();

    await waitFor(() => expect(screen.getByText('Home')).toBeTruthy());
    await act(async () => fireEvent.press(screen.getByText('Home')));

    await waitFor(() => expect(screen.getByText('Home ×')).toBeTruthy());
  });

  it('reuses an existing tag by name instead of creating a duplicate', async () => {
    await createTag(vaultKey, 'Work');

    await renderSection();
    await act(async () =>
      fireEvent.changeText(screen.getByPlaceholderText('New tag'), 'work'),
    );
    await act(async () => fireEvent.press(screen.getByText('Add')));

    await waitFor(() => expect(screen.getByText('Work ×')).toBeTruthy());
    const assigned = await listTagsForEntry(vaultKey, 'wifiCredentials', 'w1');
    expect(assigned).toHaveLength(1);
  });

  it('removes an assigned tag when its chip is pressed', async () => {
    const tag = await createTag(vaultKey, 'Work');
    await assignTag(vaultKey, tag.id, 'wifiCredentials', 'w1');

    await renderSection();
    await waitFor(() => expect(screen.getByText('Work ×')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Work ×')));

    expect(screen.queryByText('Work ×')).toBeNull();
  });
});
