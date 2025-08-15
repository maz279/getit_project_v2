/**
 * Webpack Configuration with Module Federation
 * Amazon.com/Shopee.sg-Level Module Federation Setup
 * Supports micro-frontend architecture
 */

const path = require('path');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './client/src/index.tsx',
  
  devServer: {
    port: 3000,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'client/src/shared'),
      '@domains': path.resolve(__dirname, 'client/src/domains'),
      '@assets': path.resolve(__dirname, 'assets'),
      '@design-system': path.resolve(__dirname, 'client/src/design-system'),
      '@lib': path.resolve(__dirname, 'client/src/lib'),
      '@components': path.resolve(__dirname, 'client/src/shared/components'),
      '@services': path.resolve(__dirname, 'client/src/shared/services'),
      '@hooks': path.resolve(__dirname, 'client/src/shared/hooks'),
      '@utils': path.resolve(__dirname, 'client/src/lib/utils'),
    },
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      
      // Amazon.com/Shopee.sg Enterprise Remote Apps
      remotes: {
        'customer-app': 'customerApp@http://localhost:3001/remoteEntry.js',
        'admin-app': 'adminApp@http://localhost:3002/remoteEntry.js',
        'vendor-app': 'vendorApp@http://localhost:3003/remoteEntry.js',
        'mobile-app': 'mobileApp@http://localhost:3004/remoteEntry.js',
        'analytics-app': 'analyticsApp@http://localhost:3005/remoteEntry.js',
      },
      
      // Enterprise-Grade Exposed Modules
      exposes: {
        './DesignSystem': './client/src/design-system/index.ts',
        './SharedComponents': './client/src/shared/components/index.ts',
        './SharedServices': './client/src/shared/services/index.ts',
        './PerformanceMonitor': './client/src/shared/services/performance/PerformanceMonitor.ts',
        './LocalizationService': './client/src/shared/services/advanced/LocalizationService.ts',
        './AccessibilityService': './client/src/shared/services/advanced/AccessibilityService.ts',
        './Utils': './client/src/lib/utils.ts',
      },
      
      // Amazon.com/Shopee.sg Standard Shared Dependencies
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: '^18.0.0',
        },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: '^18.0.0',
        },
        'react-router-dom': {
          singleton: true,
          eager: true,
          requiredVersion: '^6.0.0',
        },
        '@reduxjs/toolkit': {
          singleton: true,
          eager: true,
          requiredVersion: '^2.0.0',
        },
        'react-redux': {
          singleton: true,
          eager: true,
          requiredVersion: '^9.0.0',
        },
        '@tanstack/react-query': {
          singleton: true,
          eager: true,
          requiredVersion: '^5.0.0',
        },
        'wouter': {
          singleton: true,
          eager: true,
          requiredVersion: '^3.0.0',
        },
        'lucide-react': {
          singleton: true,
          eager: true,
          requiredVersion: '^0.400.0',
        },
        'tailwindcss': {
          singleton: true,
          eager: true,
        },
        'class-variance-authority': {
          singleton: true,
          eager: true,
        },
        'clsx': {
          singleton: true,
          eager: true,
        },
      },
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],

  optimization: {
    // Amazon.com/Shopee.sg Enterprise Code Splitting
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 10,
      maxAsyncRequests: 10,
      minSize: 20000,
      maxSize: 200000,
      cacheGroups: {
        // Core vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
        // React-specific vendor chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20,
          reuseExistingChunk: true,
        },
        // UI library chunk
        ui: {
          test: /[\\/]node_modules[\\/](lucide-react|@radix-ui|tailwindcss)[\\/]/,
          name: 'ui',
          priority: 15,
          reuseExistingChunk: true,
        },
        // Common shared components
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
        // Design system chunk
        designSystem: {
          test: /[\\/]client[\\/]src[\\/]design-system[\\/]/,
          name: 'design-system',
          priority: 8,
          reuseExistingChunk: true,
        },
        // Shared services chunk
        services: {
          test: /[\\/]client[\\/]src[\\/]shared[\\/]services[\\/]/,
          name: 'services',
          priority: 7,
          reuseExistingChunk: true,
        },
      },
    },
  },
};