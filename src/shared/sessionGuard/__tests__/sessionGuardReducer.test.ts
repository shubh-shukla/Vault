import {
  sessionGuardReducer,
  DEFAULT_SESSION_GUARD_CONFIG,
  INITIAL_SESSION_GUARD_STATE,
} from '../sessionGuardReducer';
import type { SessionGuardEvent, SessionGuardState } from '../types';

const NOW = 1_700_000_000_000;
const config = DEFAULT_SESSION_GUARD_CONFIG;

function stateOf(overrides: Partial<SessionGuardState>): SessionGuardState {
  return { ...INITIAL_SESSION_GUARD_STATE, ...overrides };
}

describe('sessionGuardReducer — happy path', () => {
  it('locked -> authenticating on REQUEST_UNLOCK', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'locked' }),
      { type: 'REQUEST_UNLOCK' },
      config,
      NOW,
    );
    expect(result.status).toBe('authenticating');
  });

  it('authenticating -> unlocked on AUTH_SUCCESS, resetting failedAttempts', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'authenticating', failedAttempts: 2 }),
      { type: 'AUTH_SUCCESS' },
      config,
      NOW,
    );
    expect(result).toEqual({
      status: 'unlocked',
      failedAttempts: 0,
      cooldownUntil: null,
    });
  });

  it('authenticating -> locked on AUTH_FAILURE below the threshold, incrementing failedAttempts', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'authenticating', failedAttempts: 1 }),
      { type: 'AUTH_FAILURE' },
      config,
      NOW,
    );
    expect(result).toEqual({
      status: 'locked',
      failedAttempts: 2,
      cooldownUntil: null,
    });
  });

  it('authenticating -> cooldown once AUTH_FAILURE reaches maxFailedAttempts', () => {
    const result = sessionGuardReducer(
      stateOf({
        status: 'authenticating',
        failedAttempts: config.maxFailedAttempts - 1,
      }),
      { type: 'AUTH_FAILURE' },
      config,
      NOW,
    );
    expect(result).toEqual({
      status: 'cooldown',
      failedAttempts: 0,
      cooldownUntil: NOW + config.cooldownMs,
    });
  });

  it('authenticating -> locked on AUTH_CANCELLED without counting it as a failure', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'authenticating', failedAttempts: 3 }),
      { type: 'AUTH_CANCELLED' },
      config,
      NOW,
    );
    expect(result).toEqual({
      status: 'locked',
      failedAttempts: 3,
      cooldownUntil: null,
    });
  });

  it('unlocked -> locked on IDLE_TIMEOUT', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'unlocked' }),
      { type: 'IDLE_TIMEOUT' },
      config,
      NOW,
    );
    expect(result.status).toBe('locked');
  });

  it('unlocked -> locked on APP_BACKGROUNDED', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'unlocked' }),
      { type: 'APP_BACKGROUNDED' },
      config,
      NOW,
    );
    expect(result.status).toBe('locked');
  });

  it('unlocked -> locked on manual LOCK', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'unlocked' }),
      { type: 'LOCK' },
      config,
      NOW,
    );
    expect(result.status).toBe('locked');
  });

  it('cooldown -> locked on COOLDOWN_EXPIRED, resetting failedAttempts', () => {
    const result = sessionGuardReducer(
      stateOf({ status: 'cooldown', cooldownUntil: NOW }),
      { type: 'COOLDOWN_EXPIRED' },
      config,
      NOW,
    );
    expect(result).toEqual({
      status: 'locked',
      failedAttempts: 0,
      cooldownUntil: null,
    });
  });
});

describe('sessionGuardReducer — the race: a timer firing while a prompt is already open', () => {
  it('ignores IDLE_TIMEOUT while authenticating, returning the same state reference', () => {
    const state = stateOf({ status: 'authenticating' });
    const result = sessionGuardReducer(
      state,
      { type: 'IDLE_TIMEOUT' },
      config,
      NOW,
    );
    expect(result).toBe(state);
  });

  it('ignores APP_BACKGROUNDED while authenticating, returning the same state reference', () => {
    const state = stateOf({ status: 'authenticating' });
    const result = sessionGuardReducer(
      state,
      { type: 'APP_BACKGROUNDED' },
      config,
      NOW,
    );
    expect(result).toBe(state);
  });

  it('does not let a second REQUEST_UNLOCK re-enter authentication while a prompt is open', () => {
    const state = stateOf({ status: 'authenticating' });
    const result = sessionGuardReducer(
      state,
      { type: 'REQUEST_UNLOCK' },
      config,
      NOW,
    );
    expect(result).toBe(state);
  });
});

describe('sessionGuardReducer — no-ops for every other invalid (status, event) pair', () => {
  const invalidPairsByStatus: Record<
    SessionGuardState['status'],
    SessionGuardEvent['type'][]
  > = {
    locked: [
      'AUTH_SUCCESS',
      'AUTH_FAILURE',
      'AUTH_CANCELLED',
      'IDLE_TIMEOUT',
      'APP_BACKGROUNDED',
      'LOCK',
      'COOLDOWN_EXPIRED',
    ],
    authenticating: [
      'IDLE_TIMEOUT',
      'APP_BACKGROUNDED',
      'REQUEST_UNLOCK',
      'LOCK',
      'COOLDOWN_EXPIRED',
    ],
    unlocked: [
      'REQUEST_UNLOCK',
      'AUTH_SUCCESS',
      'AUTH_FAILURE',
      'AUTH_CANCELLED',
      'COOLDOWN_EXPIRED',
    ],
    cooldown: [
      'REQUEST_UNLOCK',
      'AUTH_SUCCESS',
      'AUTH_FAILURE',
      'AUTH_CANCELLED',
      'IDLE_TIMEOUT',
      'APP_BACKGROUNDED',
      'LOCK',
    ],
  };

  for (const [status, events] of Object.entries(invalidPairsByStatus) as [
    SessionGuardState['status'],
    SessionGuardEvent['type'][],
  ][]) {
    for (const eventType of events) {
      it(`(${status}, ${eventType}) is a no-op`, () => {
        const state = stateOf({ status });
        const result = sessionGuardReducer(
          state,
          { type: eventType },
          config,
          NOW,
        );
        expect(result).toBe(state);
      });
    }
  }
});
