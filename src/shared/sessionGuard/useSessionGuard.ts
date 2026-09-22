import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { AppState } from 'react-native';
import { unlockVaultKey } from '@shared/crypto';
import {
  DEFAULT_SESSION_GUARD_CONFIG,
  INITIAL_SESSION_GUARD_STATE,
  sessionGuardReducer,
} from './sessionGuardReducer';
import type { SessionGuardConfig, SessionGuardStatus } from './types';

export interface UseSessionGuardOptions {
  config?: Partial<SessionGuardConfig>;
  onUnlocked?: (vaultKey: Buffer) => void;
  onLocked?: () => void;
}

export interface UseSessionGuardResult {
  status: SessionGuardStatus;
  failedAttempts: number;
  cooldownUntil: number | null;
  requestUnlock: () => void;
  cancelAuthentication: () => void;
  lock: () => void;
  notifyActivity: () => void;
}

export function useSessionGuard(
  options: UseSessionGuardOptions = {},
): UseSessionGuardResult {
  const config = useMemo(
    () => ({ ...DEFAULT_SESSION_GUARD_CONFIG, ...options.config }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.config?.idleTimeoutMs,
      options.config?.maxFailedAttempts,
      options.config?.cooldownMs,
    ],
  );
  const configRef = useRef(config);
  configRef.current = config;

  const onUnlockedRef = useRef(options.onUnlocked);
  onUnlockedRef.current = options.onUnlocked;
  const onLockedRef = useRef(options.onLocked);
  onLockedRef.current = options.onLocked;

  const reducer = useCallback(
    (
      state: typeof INITIAL_SESSION_GUARD_STATE,
      event: Parameters<typeof sessionGuardReducer>[1],
    ) => sessionGuardReducer(state, event, configRef.current, Date.now()),
    [],
  );
  const [state, dispatch] = useReducer(reducer, INITIAL_SESSION_GUARD_STATE);

  const previousStatusRef = useRef(state.status);
  useEffect(() => {
    if (previousStatusRef.current !== state.status) {
      if (state.status === 'locked') {
        onLockedRef.current?.();
      }
      previousStatusRef.current = state.status;
    }
  }, [state.status]);

  // Attempt authentication exactly once per entry into `authenticating`.
  useEffect(() => {
    if (state.status !== 'authenticating') {
      return;
    }

    let cancelled = false;

    unlockVaultKey()
      .then(vaultKey => {
        if (cancelled) {
          return;
        }
        onUnlockedRef.current?.(vaultKey);
        dispatch({ type: 'AUTH_SUCCESS' });
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({ type: 'AUTH_FAILURE' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.status]);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);
  const armIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(
      () => dispatch({ type: 'IDLE_TIMEOUT' }),
      config.idleTimeoutMs,
    );
  }, [clearIdleTimer, config.idleTimeoutMs]);

  useEffect(() => {
    if (state.status === 'unlocked') {
      armIdleTimer();
    } else {
      clearIdleTimer();
    }
    return clearIdleTimer;
  }, [state.status, armIdleTimer, clearIdleTimer]);

  useEffect(() => {
    if (state.status !== 'cooldown' || state.cooldownUntil === null) {
      return;
    }
    const delay = Math.max(0, state.cooldownUntil - Date.now());
    const timer = setTimeout(
      () => dispatch({ type: 'COOLDOWN_EXPIRED' }),
      delay,
    );
    return () => clearTimeout(timer);
  }, [state.status, state.cooldownUntil]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        dispatch({ type: 'APP_BACKGROUNDED' });
      }
    });
    return () => subscription.remove();
  }, []);

  const requestUnlock = useCallback(
    () => dispatch({ type: 'REQUEST_UNLOCK' }),
    [],
  );
  const cancelAuthentication = useCallback(
    () => dispatch({ type: 'AUTH_CANCELLED' }),
    [],
  );
  const lock = useCallback(() => dispatch({ type: 'LOCK' }), []);
  const notifyActivity = useCallback(() => {
    if (state.status === 'unlocked') {
      armIdleTimer();
    }
  }, [state.status, armIdleTimer]);

  return {
    status: state.status,
    failedAttempts: state.failedAttempts,
    cooldownUntil: state.cooldownUntil,
    requestUnlock,
    cancelAuthentication,
    lock,
    notifyActivity,
  };
}
