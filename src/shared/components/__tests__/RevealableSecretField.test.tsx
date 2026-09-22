import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { RevealableSecretField } from '../RevealableSecretField';

const mockClipboard = Clipboard as unknown as { __reset: () => void };

beforeEach(() => {
  mockClipboard.__reset();
});

describe('RevealableSecretField', () => {
  it('masks the value by default', async () => {
    await render(
      <RevealableSecretField label="Password" value="correct-horse" />,
    );

    expect(screen.queryByText('correct-horse')).toBeNull();
    expect(screen.getByText('••••••••')).toBeTruthy();
  });

  it('reveals the value on tap and hides it again on a second tap', async () => {
    await render(
      <RevealableSecretField label="Password" value="correct-horse" />,
    );

    await act(async () => fireEvent.press(screen.getByText('Reveal')));
    expect(screen.getByText('correct-horse')).toBeTruthy();

    await act(async () => fireEvent.press(screen.getByText('Hide')));
    expect(screen.queryByText('correct-horse')).toBeNull();
  });

  it('auto re-masks after the reveal duration elapses', async () => {
    await render(
      <RevealableSecretField
        label="Password"
        value="correct-horse"
        revealDurationMs={20}
      />,
    );

    await act(async () => fireEvent.press(screen.getByText('Reveal')));
    expect(screen.getByText('correct-horse')).toBeTruthy();

    await waitFor(() => expect(screen.queryByText('correct-horse')).toBeNull());
  });

  it('copies the value to the clipboard and clears it after the delay', async () => {
    await render(
      <RevealableSecretField
        label="Password"
        value="correct-horse"
        clipboardClearDelayMs={20}
      />,
    );

    await act(async () => fireEvent.press(screen.getByText('Copy')));
    expect(await Clipboard.getString()).toBe('correct-horse');

    await waitFor(async () => expect(await Clipboard.getString()).toBe(''));
  });

  it('does not clobber a newer clipboard value when the delay elapses', async () => {
    await render(
      <RevealableSecretField
        label="Password"
        value="correct-horse"
        clipboardClearDelayMs={20}
      />,
    );

    await act(async () => fireEvent.press(screen.getByText('Copy')));
    Clipboard.setString('something-the-user-copied-after');

    await new Promise(resolve => setTimeout(resolve, 40));
    expect(await Clipboard.getString()).toBe('something-the-user-copied-after');
  });
});
