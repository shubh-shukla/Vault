import * as Keychain from 'react-native-keychain';
import {
  provisionVaultKeyIfNeeded,
  unlockVaultKey,
  deriveSubkey,
} from '../deriveVaultKey';
import {
  VaultAuthenticationError,
  VaultKeyNotProvisionedError,
} from '../vaultKeychainService';

interface KeychainMock {
  setGenericPassword: jest.Mock;
  getGenericPassword: jest.Mock;
  hasGenericPassword: jest.Mock;
  resetGenericPassword: jest.Mock;
  __reset: () => void;
}

const mockKeychain = Keychain as unknown as KeychainMock;

beforeEach(() => {
  mockKeychain.__reset();
});

describe('provisionVaultKeyIfNeeded / unlockVaultKey', () => {
  it('generates and stores a master seed on first run', async () => {
    await provisionVaultKeyIfNeeded();

    expect(mockKeychain.setGenericPassword).toHaveBeenCalledTimes(1);
  });

  it('does not overwrite an existing master seed', async () => {
    await provisionVaultKeyIfNeeded();
    await provisionVaultKeyIfNeeded();

    expect(mockKeychain.setGenericPassword).toHaveBeenCalledTimes(1);
  });

  it('unlocks to the same seed that was provisioned', async () => {
    await provisionVaultKeyIfNeeded();
    const first = await unlockVaultKey();
    const second = await unlockVaultKey();

    expect(first).toEqual(second);
    expect(first).toHaveLength(32);
  });

  it('throws VaultKeyNotProvisionedError when unlocking before provisioning', async () => {
    await expect(unlockVaultKey()).rejects.toThrow(VaultKeyNotProvisionedError);
  });

  it('throws VaultAuthenticationError when the platform biometric prompt fails', async () => {
    await provisionVaultKeyIfNeeded();
    mockKeychain.getGenericPassword.mockRejectedValueOnce(
      new Error('user canceled'),
    );

    await expect(unlockVaultKey()).rejects.toThrow(VaultAuthenticationError);
  });
});

describe('deriveSubkey', () => {
  it('is deterministic for the same seed and purpose', () => {
    const seed = Buffer.alloc(32, 5);

    expect(deriveSubkey(seed, 'field-encryption')).toEqual(
      deriveSubkey(seed, 'field-encryption'),
    );
  });

  it('derives different keys for different purposes', () => {
    const seed = Buffer.alloc(32, 5);

    expect(deriveSubkey(seed, 'field-encryption')).not.toEqual(
      deriveSubkey(seed, 'attachment-encryption'),
    );
  });

  it('derives different keys for different seeds', () => {
    const seedA = Buffer.alloc(32, 1);
    const seedB = Buffer.alloc(32, 2);

    expect(deriveSubkey(seedA, 'field-encryption')).not.toEqual(
      deriveSubkey(seedB, 'field-encryption'),
    );
  });
});
