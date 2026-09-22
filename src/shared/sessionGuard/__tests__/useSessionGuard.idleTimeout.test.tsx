import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useSessionGuard } from '../useSessionGuard';

const mockUnlockVaultKey = jest.fn();

jest.mock('@shared/crypto', () => ({
  unlockVaultKey: (...args: unknown[]) => mockUnlockVaultKey(...args),
}));

const FAST_CONFIG = {
  idleTimeoutMs: 30,
  maxFailedAttempts: 5,
  cooldownMs: 30_000,
};

it('re-locks after the idle timeout while unlocked', async () => {
  mockUnlockVaultKey.mockResolvedValue(Buffer.alloc(32));
  const onLocked = jest.fn();
  const { result } = await renderHook(() =>
    useSessionGuard({ config: FAST_CONFIG, onLocked }),
  );

  await act(async () => result.current.requestUnlock());
  await waitFor(() => expect(result.current.status).toBe('unlocked'));

  await waitFor(() => expect(result.current.status).toBe('locked'));
  expect(onLocked).toHaveBeenCalledTimes(1);
});
