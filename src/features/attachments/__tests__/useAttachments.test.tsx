import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { useAttachments } from '../useAttachments';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const mockRNFS = RNFS as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
  mockRNFS.__reset();
});

async function renderEntryAttachments() {
  return renderHook(() => useAttachments('secureNotes', 'note-1'), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useAttachments', () => {
  it('starts empty and not loading once refreshed', async () => {
    const { result } = await renderEntryAttachments();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.attachments).toEqual([]);
  });

  it('adds an attachment and reflects it in state immediately', async () => {
    const { result } = await renderEntryAttachments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({
        fileName: 'a.pdf',
        mimeType: 'application/pdf',
        data: Buffer.from('data'),
      });
    });

    expect(result.current.attachments).toHaveLength(1);
    expect(result.current.attachments[0]).toMatchObject({ fileName: 'a.pdf' });
  });

  it('removes an attachment', async () => {
    const { result } = await renderEntryAttachments();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({
        fileName: 'a.pdf',
        mimeType: 'application/pdf',
        data: Buffer.from('data'),
      });
    });

    await act(async () => {
      await result.current.remove(result.current.attachments[0]);
    });

    expect(result.current.attachments).toEqual([]);
  });
});
