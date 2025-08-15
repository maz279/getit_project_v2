/**
 * CustomerLayout Template Tests
 * Comprehensive test suite for CustomerLayout component
 */

import { render, screen } from '@testing-library/react';
import { CustomerLayout } from '../../templates/CustomerLayout/CustomerLayout';

describe('CustomerLayout Component', () => {
  test('renders layout with children', () => {
    render(
      <CustomerLayout>
        <div data-testid="test-content">Test Content</div>
      </CustomerLayout>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('renders header with default navigation', () => {
    render(<CustomerLayout>Content</CustomerLayout>);
    
    expect(screen.getByText('GetIt')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
  });

  test('renders page title and description', () => {
    render(
      <CustomerLayout 
        pageTitle="Test Page"
        pageDescription="This is a test page description"
      >
        Content
      </CustomerLayout>
    );
    
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('This is a test page description')).toBeInTheDocument();
  });

  test('renders breadcrumb navigation', () => {
    const breadcrumb = [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/category' },
      { label: 'Product' }
    ];
    
    render(
      <CustomerLayout breadcrumb={breadcrumb}>
        Content
      </CustomerLayout>
    );
    
    breadcrumb.forEach(item => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  test('renders with sidebar', () => {
    const sidebar = <div data-testid="sidebar">Sidebar Content</div>;
    
    render(
      <CustomerLayout sidebar={sidebar}>
        <div data-testid="main-content">Main Content</div>
      </CustomerLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  test('renders footer with company information', () => {
    render(<CustomerLayout>Content</CustomerLayout>);
    
    expect(screen.getByText('© 2025 GetIt. All rights reserved.')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
  });

  test('renders newsletter signup when enabled', () => {
    render(
      <CustomerLayout footer={{ showNewsletter: true }}>
        Content
      </CustomerLayout>
    );
    
    expect(screen.getByText('Stay Updated')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  test('renders social links when enabled', () => {
    render(
      <CustomerLayout footer={{ showSocialLinks: true }}>
        Content
      </CustomerLayout>
    );
    
    // Check for social media buttons (they might not have visible text)
    const socialButtons = screen.getAllByRole('button');
    expect(socialButtons.length).toBeGreaterThan(0);
  });

  test('renders cultural mode correctly', () => {
    render(
      <CustomerLayout 
        culturalMode 
        footer={{ showCulturalInfo: true }}
      >
        Content
      </CustomerLayout>
    );
    
    expect(screen.getByText('Serving Bangladesh with Islamic values • Halal certified products')).toBeInTheDocument();
    expect(screen.getByText('Cultural Services')).toBeInTheDocument();
  });

  test('renders cultural navigation links in cultural mode', () => {
    render(
      <CustomerLayout culturalMode>
        Content
      </CustomerLayout>
    );
    
    expect(screen.getByText('Islamic Calendar')).toBeInTheDocument();
    expect(screen.getByText('Prayer Times')).toBeInTheDocument();
    expect(screen.getByText('Halal Products')).toBeInTheDocument();
    expect(screen.getByText('Ramadan Collection')).toBeInTheDocument();
  });

  test('header props are passed correctly', () => {
    const headerProps = {
      cartCount: 5,
      wishlistCount: 3,
      isAuthenticated: true
    };
    
    render(
      <CustomerLayout header={headerProps}>
        Content
      </CustomerLayout>
    );
    
    expect(screen.getByText('5')).toBeInTheDocument(); // Cart count
    expect(screen.getByText('3')).toBeInTheDocument(); // Wishlist count
  });

  test('sticky header is enabled by default', () => {
    render(<CustomerLayout>Content</CustomerLayout>);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0');
  });

  test('sticky header can be disabled', () => {
    render(<CustomerLayout sticky={false}>Content</CustomerLayout>);
    
    const header = screen.getByRole('banner');
    expect(header).not.toHaveClass('sticky');
  });

  test('layout has correct structure', () => {
    render(
      <CustomerLayout>
        <div data-testid="content">Content</div>
      </CustomerLayout>
    );
    
    const layout = screen.getByTestId('content').closest('.min-h-screen');
    expect(layout).toHaveClass('min-h-screen', 'bg-background');
  });
});