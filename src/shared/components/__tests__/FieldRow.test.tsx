import { render, screen } from '@testing-library/react-native';
import { FieldRow } from '../FieldRow';

describe('FieldRow', () => {
  it('renders the label and value', async () => {
    await render(<FieldRow label="Serial number" value="ABC-123" />);

    expect(screen.getByText('Serial number')).toBeTruthy();
    expect(screen.getByText('ABC-123')).toBeTruthy();
  });

  it('renders a placeholder when the value is empty', async () => {
    await render(<FieldRow label="Notes" value="" />);

    expect(screen.getByText('—')).toBeTruthy();
  });
});
