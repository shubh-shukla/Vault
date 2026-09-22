const ACCESS_CONTROL = {
  USER_PRESENCE: 'UserPresence',
  BIOMETRY_ANY: 'BiometryAny',
  BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
  DEVICE_PASSCODE: 'DevicePasscode',
  APPLICATION_PASSWORD: 'ApplicationPassword',
  BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
  BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BiometryCurrentSetOrDevicePasscode',
};

const ACCESSIBLE = {
  WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
  AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
  ALWAYS: 'AccessibleAlways',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'AccessibleWhenPasscodeSetThisDeviceOnly',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
    'AccessibleAfterFirstUnlockThisDeviceOnly',
};

const BIOMETRY_TYPE = {
  TOUCH_ID: 'TouchID',
  FACE_ID: 'FaceID',
  OPTIC_ID: 'OpticID',
  FINGERPRINT: 'Fingerprint',
  FACE: 'Face',
  IRIS: 'Iris',
};

const STORAGE_TYPE = {
  AES_CBC: 'KeystoreAESCBC',
  AES_GCM_NO_AUTH: 'KeystoreAESGCM_NoAuth',
  AES_GCM: 'KeystoreAESGCM',
  RSA: 'KeystoreRSAECB',
};

let store = new Map();

const setGenericPassword = jest.fn(async (username, password, options = {}) => {
  const service = options.service ?? 'default';
  store.set(service, {
    username,
    password,
    service,
    storage: STORAGE_TYPE.AES_GCM,
  });
  return { service, storage: STORAGE_TYPE.AES_GCM };
});

const getGenericPassword = jest.fn(async (options = {}) => {
  const service = options.service ?? 'default';
  return store.get(service) ?? false;
});

const hasGenericPassword = jest.fn(async (options = {}) => {
  const service = options.service ?? 'default';
  return store.has(service);
});

const resetGenericPassword = jest.fn(async (options = {}) => {
  const service = options.service ?? 'default';
  return store.delete(service);
});

const getSupportedBiometryType = jest.fn(async () => BIOMETRY_TYPE.FACE_ID);

function __reset() {
  store = new Map();
  setGenericPassword.mockClear();
  getGenericPassword.mockClear();
  hasGenericPassword.mockClear();
  resetGenericPassword.mockClear();
  getSupportedBiometryType.mockClear();
}

module.exports = {
  ACCESS_CONTROL,
  ACCESSIBLE,
  BIOMETRY_TYPE,
  STORAGE_TYPE,
  setGenericPassword,
  getGenericPassword,
  hasGenericPassword,
  resetGenericPassword,
  getSupportedBiometryType,
  __reset,
};
