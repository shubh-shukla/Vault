import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.vault.masterKey';
const USERNAME = 'vault';

const ACCESS_OPTIONS = {
  service: SERVICE,
  accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  authenticationPrompt: {
    title: 'Unlock Vault',
    cancel: 'Cancel',
  },
} as const;

export class VaultAuthenticationError extends Error {
  constructor(
    message = 'Biometric authentication failed',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'VaultAuthenticationError';
  }
}

export class VaultKeyNotProvisionedError extends Error {
  constructor(message = 'No vault master key has been provisioned yet') {
    super(message);
    this.name = 'VaultKeyNotProvisionedError';
  }
}

export async function hasStoredMasterSeed(): Promise<boolean> {
  return Keychain.hasGenericPassword({ service: SERVICE });
}

export async function storeMasterSeed(seed: Buffer): Promise<void> {
  const result = await Keychain.setGenericPassword(
    USERNAME,
    seed.toString('base64'),
    ACCESS_OPTIONS,
  );

  if (!result) {
    throw new Error(
      'Failed to store the vault master key in the platform keychain',
    );
  }
}

export async function retrieveMasterSeed(): Promise<Buffer> {
  let credentials: false | Keychain.UserCredentials;

  try {
    credentials = await Keychain.getGenericPassword(ACCESS_OPTIONS);
  } catch (cause) {
    throw new VaultAuthenticationError(undefined, { cause });
  }

  if (!credentials) {
    throw new VaultKeyNotProvisionedError();
  }

  return Buffer.from(credentials.password, 'base64');
}

export async function deleteMasterSeed(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
