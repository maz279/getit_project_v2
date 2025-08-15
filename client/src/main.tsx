import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from './app/App.tsx'
import { queryClient } from './lib/queryClient'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './domains/customer/auth/components/AuthProvider'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
