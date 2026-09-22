import { render, screen } from '@testing-library/react-native';
import { CategoryBadge } from '../CategoryBadge';
import type { CategoryIconKind } from '../CategoryIcon';

const KINDS: CategoryIconKind[] = [
  'wifi',
  'key',
  'code',
  'phone',
  'device',
  'note',
  'backup',
];

describe('CategoryBadge', () => {
  it.each(KINDS)('renders the icon for kind "%s"', async kind => {
    await render(<CategoryBadge kind={kind} />);

    expect(screen.getByTestId(`category-icon-${kind}`)).toBeTruthy();
  });

  it('renders with a muted tone', async () => {
    await render(<CategoryBadge kind="backup" muted />);

    expect(screen.getByTestId('category-icon-backup')).toBeTruthy();
  });
});
