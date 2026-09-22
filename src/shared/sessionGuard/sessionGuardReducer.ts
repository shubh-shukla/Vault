import type {
  SessionGuardConfig,
  SessionGuardEvent,
  SessionGuardState,
  SessionGuardStatus,
} from './types';

export const DEFAULT_SESSION_GUARD_CONFIG: SessionGuardConfig = {
  idleTimeoutMs: 2 * 60 * 1000,
  maxFailedAttempts: 5,
  cooldownMs: 30 * 1000,
};

export const INITIAL_SESSION_GUARD_STATE: SessionGuardState = {
  status: 'locked',
  failedAttempts: 0,
  cooldownUntil: null,
};

type Transition = (
  state: SessionGuardState,
  config: SessionGuardConfig,
  now: number,
) => SessionGuardState;

// The full state machine. Any (status, event) pair with no entry here is an
// intentional no-op: the event is dropped and `state` is returned unchanged,
// which is what makes a timer firing mid-authentication, or a stale event
// arriving after a lock, safe rather than a race.
const TRANSITION_TABLE: Record<
  SessionGuardStatus,
  Partial<Record<SessionGuardEvent['type'], Transition>>
> = {
  locked: {
    REQUEST_UNLOCK: state => ({ ...state, status: 'authenticating' }),
  },
  authenticating: {
    AUTH_SUCCESS: state => ({
      ...state,
      status: 'unlocked',
      failedAttempts: 0,
    }),
    AUTH_FAILURE: (state, config, now) => {
      const failedAttempts = state.failedAttempts + 1;
      if (failedAttempts >= config.maxFailedAttempts) {
        return {
          status: 'cooldown',
          failedAttempts: 0,
          cooldownUntil: now + config.cooldownMs,
        };
      }
      return { ...state, status: 'locked', failedAttempts };
    },
    AUTH_CANCELLED: state => ({ ...state, status: 'locked' }),
  },
  unlocked: {
    IDLE_TIMEOUT: state => ({ ...state, status: 'locked' }),
    APP_BACKGROUNDED: state => ({ ...state, status: 'locked' }),
    LOCK: state => ({ ...state, status: 'locked' }),
  },
  cooldown: {
    COOLDOWN_EXPIRED: () => ({
      status: 'locked',
      failedAttempts: 0,
      cooldownUntil: null,
    }),
  },
};

export function sessionGuardReducer(
  state: SessionGuardState,
  event: SessionGuardEvent,
  config: SessionGuardConfig = DEFAULT_SESSION_GUARD_CONFIG,
  now: number = Date.now(),
): SessionGuardState {
  const transition = TRANSITION_TABLE[state.status][event.type];
  return transition ? transition(state, config, now) : state;
}
