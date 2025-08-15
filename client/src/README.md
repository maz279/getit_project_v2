
# Project Structure

This document outlines the folder structure and organization of the GetIt Bangladesh e-commerce platform.

## Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (buttons, inputs, etc.)
│   ├── layout/          # Layout components (headers, footers, etc.)
│   ├── homepage/        # Homepage specific components
│   ├── auth/           # Authentication components
│   ├── vendor/         # Vendor-related components
│   ├── admin/          # Admin dashboard components
│   ├── categories/     # Category browsing components
│   ├── wishlist/       # Wishlist components
│   └── index.ts        # Component exports
│
├── pages/              # Page components
│   ├── common/         # Common pages (404, etc.)
│   ├── auth/          # Authentication pages
│   ├── shop/          # Shopping related pages
│   ├── account/       # User account pages
│   ├── order/         # Order management pages
│   ├── promotions/    # Sales and promotion pages
│   ├── support/       # Customer support pages
│   ├── vendor/        # Vendor pages
│   ├── admin/         # Admin pages
│   └── index.ts       # Page exports
│
├── context/           # React context providers
├── hooks/            # Custom React hooks
├── services/         # API and business logic services
├── utils/            # Utility functions
├── constants/        # Application constants
├── data/             # Static data and mock data
├── types/            # TypeScript type definitions
└── lib/              # Third-party library configurations
```

## Page Organization

### Common Pages (`pages/common/`)
- `NotFound.tsx` - 404 error page

### Authentication (`pages/auth/`)
- `Login.tsx` - User login page
- `Register.tsx` - User registration page

### Shopping (`pages/shop/`)
- `Cart.tsx` - Shopping cart
- `GiftCards.tsx` - Gift card purchasing
- `GroupBuy.tsx` - Group buying functionality
- `Premium.tsx` - Premium products

### Account Management (`pages/account/`)
- `MyAccount.tsx` - User profile and account overview
- `Orders.tsx` - Order history
- `Settings.tsx` - Account settings
- `PaymentMethods.tsx` - Payment method management

### Order Management (`pages/order/`)
- `OrderTracking.tsx` - Order tracking interface
- `TrackOrder.tsx` - Order tracking by number

### Promotions (`pages/promotions/`)
- `FlashSale.tsx` - Flash sale events
- `DailyDeals.tsx` - Daily deals
- `MegaSale.tsx` - Major sale events

### Support (`pages/support/`)
- `HelpCenter.tsx` - Customer support center

### Vendor (`pages/vendor/`)
- `Dashboard.tsx` - Vendor dashboard

### Admin (`pages/admin/`)
- `AdminDashboard.tsx` - Admin control panel

## Component Organization

Components are organized by feature and complexity:

- **UI Components**: Basic building blocks (buttons, inputs, cards)
- **Layout Components**: Page structure components (headers, footers, sidebars)
- **Feature Components**: Business logic components organized by feature area
- **Page Components**: Top-level page components that compose other components

## Constants and Configuration

- `constants/routes.ts` - Application route definitions
- `utils/navigation.ts` - Navigation helper functions
- `types/index.ts` - Global type definitions

## Best Practices

1. **Single Responsibility**: Each component should have a single, well-defined purpose
2. **Consistent Naming**: Use PascalCase for components, camelCase for functions
3. **Proper Imports**: Use absolute imports with the `@/` alias
4. **Type Safety**: All components should be properly typed with TypeScript
5. **Code Organization**: Keep related functionality together in logical folders
