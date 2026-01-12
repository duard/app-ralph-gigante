import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Label } from '@/components/ui/label';

describe('Label Component', () => {
  it('renders correctly with text content', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Test Label</Label>);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toHaveClass('custom-class');
  });

  it('forwards props correctly', () => {
    render(
      <Label htmlFor="test-input" data-testid="test-label">
        Test Label
      </Label>
    );
    const labelElement = screen.getByTestId('test-label');
    expect(labelElement).toHaveAttribute('for', 'test-input');
  });

  it('has default accessibility classes', () => {
    render(<Label>Test Label</Label>);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'text-sm',
      'leading-none',
      'font-medium',
      'select-none'
    );
  });

  it('combines default and custom classes correctly', () => {
    render(<Label className="text-red-500">Test Label</Label>);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toHaveClass('flex', 'text-red-500');
  });
});
