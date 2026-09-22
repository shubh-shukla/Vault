import { render, screen } from '@testing-library/react-native';
import { CategoryBadge } from '../CategoryBadge';

describe('CategoryBadge', () => {
  it('renders the glyph', async () => {
    await render(<CategoryBadge glyph="W" />);

    expect(screen.getByText('W')).toBeTruthy();
  });
});
