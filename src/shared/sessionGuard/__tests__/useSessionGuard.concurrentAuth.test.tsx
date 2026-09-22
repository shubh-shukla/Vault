import { act, renderHook, waitFor } from '@testing-library/react-native';
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

it('does not start a second authentication attempt while one is already in flight', async () => {
  let resolveUnlock: (value: Buffer) => void = () => {};
  mockUnlockVaultKey.mockImplementation(
    () =>
      new Promise<Buffer>(resolve => {
        resolveUnlock = resolve;
      }),
  );
  const { result } = await renderHook(() =>
    useSessionGuard({ config: FAST_CONFIG }),
  );

  await act(async () => result.current.requestUnlock());
  expect(result.current.status).toBe('authenticating');

  // A second request while the first prompt is still open — the exact race
  // called out in the spec — must be a no-op rather than a second attempt.
  await act(async () => result.current.requestUnlock());
  expect(result.current.status).toBe('authenticating');
  expect(mockUnlockVaultKey).toHaveBeenCalledTimes(1);

  await act(async () => resolveUnlock(Buffer.alloc(32)));
  await waitFor(() => expect(result.current.status).toBe('unlocked'));
});
