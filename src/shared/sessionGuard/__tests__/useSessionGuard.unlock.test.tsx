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

it('unlocks after a successful authentication attempt', async () => {
  mockUnlockVaultKey.mockResolvedValue(Buffer.alloc(32));
  const onUnlocked = jest.fn();
  const { result } = await renderHook(() =>
    useSessionGuard({ config: FAST_CONFIG, onUnlocked }),
  );

  expect(result.current.status).toBe('locked');
  await act(async () => result.current.requestUnlock());

  await waitFor(() => expect(result.current.status).toBe('unlocked'));
  expect(onUnlocked).toHaveBeenCalledWith(expect.any(Buffer));
});
