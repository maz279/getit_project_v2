/**
 * Input Atom Tests
 * Comprehensive test suite for Input component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../../atoms/Input/Input';

describe('Input Component', () => {
  test('renders input with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  test('renders all input variants', () => {
    const variants = ['default', 'error', 'success', 'warning'] as const;
    
    variants.forEach(variant => {
      render(<Input variant={variant} placeholder={variant} />);
      const input = screen.getByPlaceholderText(variant);
      if (variant === 'error') {
        expect(input).toHaveClass('border-red-500');
      } else if (variant === 'success') {
        expect(input).toHaveClass('border-green-500');
      } else if (variant === 'warning') {
        expect(input).toHaveClass('border-yellow-500');
      }
    });
  });

  test('renders all input sizes', () => {
    const sizes = ['default', 'sm', 'lg'] as const;
    
    sizes.forEach(size => {
      render(<Input size={size} placeholder={size} />);
      const input = screen.getByPlaceholderText(size);
      expect(input).toHaveClass(size === 'default' ? 'h-10' : `h-${size === 'sm' ? '8' : '12'}`);
    });
  });

  test('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="test" />);
    
    const input = screen.getByPlaceholderText('test');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'new value' })
    }));
  });

  test('renders with icons', () => {
    render(
      <Input 
        leftIcon={<span data-testid="left-icon">📧</span>}
        rightIcon={<span data-testid="right-icon">🔍</span>}
        placeholder="With icons"
      />
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  test('shows error message', () => {
    render(<Input error="This field is required" placeholder="test" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-red-500');
  });

  test('shows success message', () => {
    render(<Input success="Valid input" placeholder="test" />);
    expect(screen.getByText('Valid input')).toBeInTheDocument();
    expect(screen.getByText('Valid input')).toHaveClass('text-green-500');
  });

  test('shows helper text', () => {
    render(<Input helperText="Enter your email address" placeholder="test" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address')).toHaveClass('text-muted-foreground');
  });

  test('disabled state works correctly', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  test('different input types work', () => {
    const types = ['email', 'password', 'number', 'tel'] as const;
    
    types.forEach(type => {
      render(<Input type={type} placeholder={type} />);
      const input = screen.getByPlaceholderText(type);
      expect(input).toHaveAttribute('type', type);
    });
  });
});