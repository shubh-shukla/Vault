export type SessionGuardStatus =
  | 'locked'
  | 'authenticating'
  | 'unlocked'
  | 'cooldown';

export interface SessionGuardState {
  status: SessionGuardStatus;
  failedAttempts: number;
  cooldownUntil: number | null;
}

export type SessionGuardEvent =
  | { type: 'REQUEST_UNLOCK' }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_FAILURE' }
  | { type: 'AUTH_CANCELLED' }
  | { type: 'IDLE_TIMEOUT' }
  | { type: 'APP_BACKGROUNDED' }
  | { type: 'LOCK' }
  | { type: 'COOLDOWN_EXPIRED' };

export interface SessionGuardConfig {
  idleTimeoutMs: number;
  maxFailedAttempts: number;
  cooldownMs: number;
}
