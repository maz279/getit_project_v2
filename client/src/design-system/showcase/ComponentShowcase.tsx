/**
 * Component Showcase
 * Interactive showcase for all design system components
 */

import { useState } from 'react';
import { Button } from '../atoms/Button/Button';
import { Input } from '../atoms/Input/Input';
import { Icon } from '../atoms/Icon/Icon';
import { Typography } from '../atoms/Typography/Typography';
import { SearchBar } from '../molecules/SearchBar/SearchBar';
import { ProductCard } from '../molecules/ProductCard/ProductCard';
import { FormField } from '../molecules/FormField/FormField';
import { Header } from '../organisms/Header/Header';
// ProductGrid import removed - Now using @/shared/modernization/phase1/ProductGrid as single source of truth
// import { ProductGrid } from '../organisms/ProductGrid/ProductGrid';
import { CheckoutForm } from '../organisms/CheckoutForm/CheckoutForm';
import { CustomerLayout } from '../templates/CustomerLayout/CustomerLayout';
import { AdminLayout } from '../templates/AdminLayout/AdminLayout';
import { VendorLayout } from '../templates/VendorLayout/VendorLayout';
import { tokens } from '../tokens';
import { COMPONENT_DOCUMENTATION } from '../index';

export const ComponentShowcase = () => {
  const [activeTab, setActiveTab] = useState<'atoms' | 'molecules' | 'organisms' | 'templates'>('atoms');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const tabs = [
    { id: 'atoms', label: 'Atoms', count: COMPONENT_DOCUMENTATION.atoms.count },
    { id: 'molecules', label: 'Molecules', count: COMPONENT_DOCUMENTATION.molecules.count },
    { id: 'organisms', label: 'Organisms', count: COMPONENT_DOCUMENTATION.organisms.count },
    { id: 'templates', label: 'Templates', count: COMPONENT_DOCUMENTATION.templates.count }
  ];

  const renderAtoms = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <Typography variant="h3">Button Components</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Typography variant="small">Variants</Typography>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="cultural">Cultural</Button>
              <Button variant="islamic">Islamic</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Typography variant="small">Sizes</Typography>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">X-Large</Button>
              <Button size="icon">🔍</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Typography variant="small">States</Typography>
            <div className="flex flex-wrap gap-2">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<span>📧</span>}>With Icon</Button>
              <Button rightIcon={<span>→</span>}>With Icon</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Typography variant="h3">Input Components</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Typography variant="small">Variants</Typography>
            <div className="space-y-2">
              <Input placeholder="Default input" />
              <Input variant="error" placeholder="Error input" />
              <Input variant="success" placeholder="Success input" />
              <Input variant="warning" placeholder="Warning input" />
            </div>
          </div>
          <div className="space-y-2">
            <Typography variant="small">Sizes</Typography>
            <div className="space-y-2">
              <Input size="sm" placeholder="Small input" />
              <Input size="default" placeholder="Default input" />
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>
          <div className="space-y-2">
            <Typography variant="small">With Icons</Typography>
            <div className="space-y-2">
              <Input leftIcon={<span>📧</span>} placeholder="Email" />
              <Input rightIcon={<span>🔍</span>} placeholder="Search" />
              <Input 
                leftIcon={<span>📧</span>} 
                rightIcon={<span>✓</span>} 
                placeholder="Both icons" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Typography variant="h3">Typography Components</Typography>
        <div className="space-y-2">
          <Typography variant="h1">Heading 1</Typography>
          <Typography variant="h2">Heading 2</Typography>
          <Typography variant="h3">Heading 3</Typography>
          <Typography variant="h4">Heading 4</Typography>
          <Typography variant="h5">Heading 5</Typography>
          <Typography variant="h6">Heading 6</Typography>
          <Typography variant="p">Paragraph text</Typography>
          <Typography variant="lead">Lead text</Typography>
          <Typography variant="large">Large text</Typography>
          <Typography variant="small">Small text</Typography>
          <Typography variant="muted">Muted text</Typography>
          <Typography variant="caption">Caption text</Typography>
        </div>
      </div>

      <div className="space-y-4">
        <Typography variant="h3">Icon Components</Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-2">
            <Icon size="xs" color="primary">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </Icon>
            <Typography variant="small">XS</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Icon size="sm" color="secondary">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </Icon>
            <Typography variant="small">SM</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Icon size="md" color="success">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </Icon>
            <Typography variant="small">MD</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Icon size="lg" color="warning">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </Icon>
            <Typography variant="small">LG</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Icon size="xl" color="error">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </Icon>
            <Typography variant="small">XL</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Icon size="2xl" color="cultural">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </Icon>
            <Typography variant="small">2XL</Typography>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMolecules = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <Typography variant="h3">SearchBar Component</Typography>
        <div className="space-y-4">
          <SearchBar placeholder="Default search" />
          <SearchBar size="sm" placeholder="Small search" />
          <SearchBar size="lg" placeholder="Large search" />
          <SearchBar variant="outlined" placeholder="Outlined search" />
          <SearchBar variant="filled" placeholder="Filled search" />
          <SearchBar loading placeholder="Loading search" />
          <SearchBar disabled placeholder="Disabled search" />
        </div>
      </div>

      <div className="space-y-4">
        <Typography variant="h3">ProductCard Component</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProductCard 
            product={{
              id: '1',
              name: 'Sample Product',
              price: 29.99,
              image: '/api/placeholder/300/200',
              rating: 4.5,
              reviews: 123,
              discount: 20
            }}
          />
          <ProductCard 
            product={{
              id: '2',
              name: 'Cultural Product',
              price: 39.99,
              image: '/api/placeholder/300/200',
              rating: 4.8,
              reviews: 456,
              badge: 'Best Seller'
            }}
            variant="cultural"
          />
          <ProductCard 
            product={{
              id: '3',
              name: 'Islamic Product',
              price: 19.99,
              image: '/api/placeholder/300/200',
              rating: 4.3,
              reviews: 789,
              halal: true
            }}
            variant="islamic"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Typography variant="h3">FormField Component</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            helperText="We'll never share your email"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
          />
          <FormField
            label="Name"
            name="name"
            placeholder="Enter your name"
            error="Name is required"
          />
          <FormField
            label="Phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone"
            success="Phone number is valid"
          />
        </div>
      </div>
    </div>
  );

  const renderOrganisms = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <Typography variant="h3">Header Component</Typography>
        <div className="space-y-4">
          <Header />
          <Header variant="cultural" />
          <Header variant="minimal" />
        </div>
      </div>

      <div className="space-y-4">
        <Typography variant="h3">ProductGrid Component</Typography>
        <ProductGrid 
          products={[
            {
              id: '1',
              name: 'Product 1',
              price: 29.99,
              image: '/api/placeholder/300/200',
              rating: 4.5,
              reviews: 123
            },
            {
              id: '2',
              name: 'Product 2',
              price: 39.99,
              image: '/api/placeholder/300/200',
              rating: 4.8,
              reviews: 456
            },
            {
              id: '3',
              name: 'Product 3',
              price: 19.99,
              image: '/api/placeholder/300/200',
              rating: 4.3,
              reviews: 789
            }
          ]}
        />
      </div>

      <div className="space-y-4">
        <Typography variant="h3">CheckoutForm Component</Typography>
        <div className="max-w-md">
          <CheckoutForm />
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <Typography variant="h3">Layout Templates</Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <Typography variant="h4">CustomerLayout</Typography>
            <Typography variant="small" color="muted">
              Customer-facing pages with header, footer, and navigation
            </Typography>
          </div>
          <div className="border rounded-lg p-4">
            <Typography variant="h4">AdminLayout</Typography>
            <Typography variant="small" color="muted">
              Admin dashboard with sidebar and header
            </Typography>
          </div>
          <div className="border rounded-lg p-4">
            <Typography variant="h4">VendorLayout</Typography>
            <Typography variant="small" color="muted">
              Vendor dashboard with specialized navigation
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'atoms':
        return renderAtoms();
      case 'molecules':
        return renderMolecules();
      case 'organisms':
        return renderOrganisms();
      case 'templates':
        return renderTemplates();
      default:
        return renderAtoms();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Typography variant="h1" className="mb-2">Design System Showcase</Typography>
          <Typography variant="lead" color="muted">
            Interactive showcase of all design system components
          </Typography>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              {tab.label}
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs">
                {tab.count}
              </span>
            </Button>
          ))}
        </div>

        <div className="bg-card rounded-lg border p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;