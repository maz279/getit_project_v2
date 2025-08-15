/**
 * Button Atom Tests
 * Comprehensive test suite for Button component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../atoms/Button/Button';

describe('Button Component', () => {
  test('renders button with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  test('renders all button variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning', 'cultural', 'islamic'] as const;
    
    variants.forEach(variant => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button')).toHaveClass(`bg-${variant === 'default' ? 'primary' : variant}`);
    });
  });

  test('renders all button sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'xl', 'icon'] as const;
    
    sizes.forEach(size => {
      render(<Button size={size}>{size}</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(size === 'default' ? 'h-9' : `h-${size === 'sm' ? '8' : size === 'lg' ? '10' : size === 'xl' ? '12' : '9'}`);
    });
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('disabled state prevents clicks', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('renders with icons', () => {
    render(
      <Button 
        leftIcon={<span data-testid="left-icon">📧</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        With Icons
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  test('cultural variant has correct styling', () => {
    render(<Button variant="cultural">Cultural Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-700');
  });

  test('islamic variant has correct styling', () => {
    render(<Button variant="islamic">Islamic Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-emerald-600');
  });
});