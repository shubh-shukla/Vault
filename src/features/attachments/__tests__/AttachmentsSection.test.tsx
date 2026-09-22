import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { AttachmentsSection } from '../AttachmentsSection';

const mockAsyncStorage = AsyncStorage as unknown as {
  __reset: () => void;
  __setFile?: never;
};
const mockRNFS = RNFS as unknown as {
  __reset: () => void;
  __setFile: (path: string, contents: string) => void;
};
const vaultKey = Buffer.alloc(32, 5);

function renderSection() {
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <AttachmentsSection entryType="secureNotes" entryId="note-1" />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
  mockRNFS.__reset();
  (pick as jest.Mock).mockReset();
  (keepLocalCopy as jest.Mock).mockReset();
});

describe('AttachmentsSection', () => {
  it('imports a picked file: reads it, encrypts it, and lists it', async () => {
    (pick as jest.Mock).mockResolvedValue([
      {
        uri: 'content://picked/receipt.pdf',
        name: 'receipt.pdf',
        type: 'application/pdf',
      },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValue([
      {
        status: 'success',
        sourceUri: 'content://picked/receipt.pdf',
        localUri: 'file:///mock/caches/receipt.pdf',
      },
    ]);
    mockRNFS.__setFile(
      '/mock/caches/receipt.pdf',
      Buffer.from('pdf bytes').toString('base64'),
    );

    await renderSection();

    await act(async () => fireEvent.press(screen.getByText('Add attachment')));

    await waitFor(() => expect(screen.getByText('receipt.pdf')).toBeTruthy());
  });

  it('deletes the temporary cache copy after importing', async () => {
    (pick as jest.Mock).mockResolvedValue([
      {
        uri: 'content://picked/receipt.pdf',
        name: 'receipt.pdf',
        type: 'application/pdf',
      },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValue([
      {
        status: 'success',
        sourceUri: 'content://picked/receipt.pdf',
        localUri: 'file:///mock/caches/receipt.pdf',
      },
    ]);
    mockRNFS.__setFile(
      '/mock/caches/receipt.pdf',
      Buffer.from('pdf bytes').toString('base64'),
    );

    await renderSection();
    await act(async () => fireEvent.press(screen.getByText('Add attachment')));
    await waitFor(() => expect(screen.getByText('receipt.pdf')).toBeTruthy());

    await expect(RNFS.readFile('/mock/caches/receipt.pdf')).rejects.toThrow();
  });

  it('removes an attachment when Remove is pressed', async () => {
    (pick as jest.Mock).mockResolvedValue([
      {
        uri: 'content://picked/receipt.pdf',
        name: 'receipt.pdf',
        type: 'application/pdf',
      },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValue([
      {
        status: 'success',
        sourceUri: 'content://picked/receipt.pdf',
        localUri: 'file:///mock/caches/receipt.pdf',
      },
    ]);
    mockRNFS.__setFile(
      '/mock/caches/receipt.pdf',
      Buffer.from('pdf bytes').toString('base64'),
    );

    await renderSection();
    await act(async () => fireEvent.press(screen.getByText('Add attachment')));
    await waitFor(() => expect(screen.getByText('receipt.pdf')).toBeTruthy());

    await act(async () => fireEvent.press(screen.getByText('Remove')));

    expect(screen.queryByText('receipt.pdf')).toBeNull();
  });
});
