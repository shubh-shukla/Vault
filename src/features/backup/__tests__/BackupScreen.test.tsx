import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {
  pick,
  keepLocalCopy,
  saveDocuments,
} from '@react-native-documents/picker';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import {
  saveWifiCredential,
  listWifiCredentials,
} from '@features/wifiCredentials';
import { BackupScreen } from '../BackupScreen';
import { exportVaultBackup } from '../backupService';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const mockRNFS = RNFS as unknown as {
  __reset: () => void;
  __setFile: (path: string, contents: string) => void;
};
const vaultKey = Buffer.alloc(32, 5);

function renderBackupScreen() {
  return render(
    <VaultKeyProvider vaultKey={vaultKey}>
      <BackupScreen />
    </VaultKeyProvider>,
  );
}

beforeEach(() => {
  mockAsyncStorage.__reset();
  mockRNFS.__reset();
  (pick as jest.Mock).mockReset();
  (keepLocalCopy as jest.Mock).mockReset();
  (saveDocuments as jest.Mock).mockReset();
});

describe('BackupScreen — export', () => {
  it('requires a passphrase before exporting', async () => {
    await renderBackupScreen();

    await act(async () => fireEvent.press(screen.getByText('Export backup')));

    expect(
      screen.getByText('Enter a passphrase to encrypt the backup.'),
    ).toBeTruthy();
    expect(saveDocuments).not.toHaveBeenCalled();
  });

  it('writes an encrypted backup and prompts the user to save it, then cleans up the temp file', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    (saveDocuments as jest.Mock).mockResolvedValue([
      {
        uri: 'file:///saved/vault-backup.json',
        name: 'vault-backup.json',
        error: null,
      },
    ]);
    await renderBackupScreen();

    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Passphrase'),
        'correct horse',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Export backup')));

    await waitFor(() =>
      expect(screen.getByText('Backup exported.')).toBeTruthy(),
    );
    expect(saveDocuments).toHaveBeenCalledTimes(1);

    const [tempPath] = (RNFS.writeFile as jest.Mock).mock.calls[0];
    await expect(RNFS.readFile(tempPath)).rejects.toThrow();
  });
});

describe('BackupScreen — import', () => {
  it('requires a passphrase before importing', async () => {
    await renderBackupScreen();

    await act(async () => fireEvent.press(screen.getByText('Import backup')));

    expect(
      screen.getByText('Enter the passphrase this backup was exported with.'),
    ).toBeTruthy();
    expect(pick).not.toHaveBeenCalled();
  });

  it('imports a picked backup file and reports how many entries were restored', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    const exported = await exportVaultBackup(vaultKey, 'correct horse');
    mockAsyncStorage.__reset();

    (pick as jest.Mock).mockResolvedValue([
      { uri: 'content://picked/vault-backup.json', name: 'vault-backup.json' },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValue([
      {
        status: 'success',
        sourceUri: 'content://picked/vault-backup.json',
        localUri: 'file:///mock/caches/vault-backup.json',
      },
    ]);
    mockRNFS.__setFile('/mock/caches/vault-backup.json', exported);

    await renderBackupScreen();
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Passphrase'),
        'correct horse',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Import backup')));

    await waitFor(() =>
      expect(
        screen.getByText('Imported 1 entries and 0 attachments.'),
      ).toBeTruthy(),
    );
    expect(await listWifiCredentials(vaultKey)).toEqual([
      { id: 'w1', ssid: 'HomeWifi', password: 'pw', notes: '' },
    ]);
  });

  it('reports an error for an incorrect passphrase', async () => {
    await saveWifiCredential(vaultKey, {
      id: 'w1',
      ssid: 'HomeWifi',
      password: 'pw',
      notes: '',
    });
    const exported = await exportVaultBackup(vaultKey, 'correct horse');
    mockAsyncStorage.__reset();

    (pick as jest.Mock).mockResolvedValue([
      { uri: 'content://picked/vault-backup.json', name: 'vault-backup.json' },
    ]);
    (keepLocalCopy as jest.Mock).mockResolvedValue([
      {
        status: 'success',
        sourceUri: 'content://picked/vault-backup.json',
        localUri: 'file:///mock/caches/vault-backup.json',
      },
    ]);
    mockRNFS.__setFile('/mock/caches/vault-backup.json', exported);

    await renderBackupScreen();
    await act(async () =>
      fireEvent.changeText(
        screen.getByPlaceholderText('Passphrase'),
        'wrong-passphrase',
      ),
    );
    await act(async () => fireEvent.press(screen.getByText('Import backup')));

    await waitFor(() =>
      expect(
        screen.getByText('Incorrect passphrase or corrupted backup file.'),
      ).toBeTruthy(),
    );
  });
});
