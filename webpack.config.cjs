/**
 * Webpack Configuration for Module Federation (CommonJS)
 * Phase 1 Week 1-2: Micro-Frontend Architecture Setup
 */

const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './client/src/index.tsx',
  
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        customer: 'customer@http://localhost:3001/remoteEntry.js',
        admin: 'admin@http://localhost:3002/remoteEntry.js',
        vendor: 'vendor@http://localhost:3003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        '@reduxjs/toolkit': { singleton: true, eager: true },
        'react-redux': { singleton: true, eager: true },
        '@tanstack/react-query': { singleton: true, eager: true },
      },
    }),
  ],
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 200000, // 200KB
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve('./client/src'),
      '@shared': path.resolve('./shared'),
      '@assets': path.resolve('./attached_assets'),
    },
  },
  
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
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
  
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
};