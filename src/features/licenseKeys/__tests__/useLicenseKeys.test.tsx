import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { VaultKeyProvider } from '@app/VaultKeyContext';
import { useLicenseKeys } from '../useLicenseKeys';

const mockAsyncStorage = AsyncStorage as unknown as { __reset: () => void };
const vaultKey = Buffer.alloc(32, 5);

beforeEach(() => {
  mockAsyncStorage.__reset();
});

async function renderLicenseKeys() {
  return renderHook(() => useLicenseKeys(), {
    wrapper: ({ children }) => (
      <VaultKeyProvider vaultKey={vaultKey}>{children}</VaultKeyProvider>
    ),
  });
}

describe('useLicenseKeys', () => {
  it('starts empty and not loading once refreshed', async () => {
    const { result } = await renderLicenseKeys();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.licenseKeys).toEqual([]);
  });

  it('creates a license key and reflects it in state immediately', async () => {
    const { result } = await renderLicenseKeys();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.create({
        productName: 'Photo Editor Pro',
        key: 'XXXX-YYYY',
        purchaseNotes: '',
      });
    });

    expect(result.current.licenseKeys).toHaveLength(1);
    expect(result.current.licenseKeys[0]).toMatchObject({
      productName: 'Photo Editor Pro',
      key: 'XXXX-YYYY',
    });
  });

  it('updates a license key', async () => {
    const { result } = await renderLicenseKeys();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        productName: 'Photo Editor Pro',
        key: 'XXXX-YYYY',
        purchaseNotes: '',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.update({
        id: createdId,
        productName: 'Photo Editor Pro',
        key: 'NEW-KEY',
        purchaseNotes: 'updated',
      });
    });

    expect(result.current.licenseKeys[0]).toMatchObject({
      key: 'NEW-KEY',
      purchaseNotes: 'updated',
    });
  });

  it('removes a license key', async () => {
    const { result } = await renderLicenseKeys();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let createdId = '';
    await act(async () => {
      const created = await result.current.create({
        productName: 'Photo Editor Pro',
        key: 'XXXX-YYYY',
        purchaseNotes: '',
      });
      createdId = created.id;
    });

    await act(async () => {
      await result.current.remove(createdId);
    });

    expect(result.current.licenseKeys).toEqual([]);
  });
});
