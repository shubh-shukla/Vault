import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useSessionGuard } from '../useSessionGuard';

const mockUnlockVaultKey = jest.fn();

jest.mock('@shared/crypto', () => ({
  unlockVaultKey: (...args: unknown[]) => mockUnlockVaultKey(...args),
}));

const FAST_CONFIG = {
  idleTimeoutMs: 30_000,
  maxFailedAttempts: 2,
  cooldownMs: 30,
};

it('locks out after maxFailedAttempts and recovers once the cooldown elapses', async () => {
  mockUnlockVaultKey.mockRejectedValue(new Error('biometric mismatch'));
  const { result } = await renderHook(() =>
    useSessionGuard({ config: FAST_CONFIG }),
  );

  for (let attempt = 0; attempt < FAST_CONFIG.maxFailedAttempts; attempt += 1) {
    await act(async () => result.current.requestUnlock());
    await waitFor(() =>
      expect(['locked', 'cooldown']).toContain(result.current.status),
    );
  }

  expect(result.current.status).toBe('cooldown');

  await waitFor(() => expect(result.current.status).toBe('locked'));
  expect(result.current.failedAttempts).toBe(0);
});
