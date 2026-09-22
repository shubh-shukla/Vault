import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useSessionGuard } from '../useSessionGuard';

const mockUnlockVaultKey = jest.fn();

jest.mock('@shared/crypto', () => ({
  unlockVaultKey: (...args: unknown[]) => mockUnlockVaultKey(...args),
}));

const FAST_CONFIG = {
  idleTimeoutMs: 30_000,
  maxFailedAttempts: 5,
  cooldownMs: 30_000,
};

function getAppStateListener(): (state: string) => void {
  const calls = (AppState.addEventListener as jest.Mock).mock.calls;
  const changeCall = calls.find(([eventName]) => eventName === 'change');
  if (!changeCall) {
    throw new Error('No AppState "change" listener was registered');
  }
  return changeCall[1];
}

beforeEach(() => {
  jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() });
});

it('re-locks immediately when the app backgrounds while unlocked', async () => {
  mockUnlockVaultKey.mockResolvedValue(Buffer.alloc(32));
  const { result } = await renderHook(() =>
    useSessionGuard({ config: FAST_CONFIG }),
  );

  await act(async () => result.current.requestUnlock());
  await waitFor(() => expect(result.current.status).toBe('unlocked'));

  await act(async () => getAppStateListener()('background'));

  expect(result.current.status).toBe('locked');
});
