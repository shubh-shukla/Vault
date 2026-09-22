import { fireEvent, render, screen } from '@testing-library/react-native';
import { UnlockScreen } from '../UnlockScreen';

describe('UnlockScreen', () => {
  it('shows an Unlock button when locked and calls onRequestUnlock when pressed', async () => {
    const onRequestUnlock = jest.fn();
    await render(
      <UnlockScreen
        status="locked"
        failedAttempts={0}
        cooldownUntil={null}
        onRequestUnlock={onRequestUnlock}
      />,
    );

    fireEvent.press(screen.getByRole('button'));
    expect(onRequestUnlock).toHaveBeenCalledTimes(1);
  });

  it('shows the failed attempt count when locked after a failure', async () => {
    await render(
      <UnlockScreen
        status="locked"
        failedAttempts={2}
        cooldownUntil={null}
        onRequestUnlock={() => {}}
      />,
    );

    expect(screen.getByText('2 failed attempts')).toBeTruthy();
  });

  it('does not show a failed attempt count on the first unlock', async () => {
    await render(
      <UnlockScreen
        status="locked"
        failedAttempts={0}
        cooldownUntil={null}
        onRequestUnlock={() => {}}
      />,
    );

    expect(screen.queryByText(/failed attempt/)).toBeNull();
  });

  it('shows an authenticating indicator and no unlock button while authenticating', async () => {
    await render(
      <UnlockScreen
        status="authenticating"
        failedAttempts={0}
        cooldownUntil={null}
        onRequestUnlock={() => {}}
      />,
    );

    expect(screen.getByText('Authenticating…')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows a cooldown countdown and no unlock button while in cooldown', async () => {
    await render(
      <UnlockScreen
        status="cooldown"
        failedAttempts={5}
        cooldownUntil={Date.now() + 30_000}
        onRequestUnlock={() => {}}
      />,
    );

    expect(screen.getByText('Too many failed attempts')).toBeTruthy();
    expect(screen.getByText(/Try again in \d+s/)).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
