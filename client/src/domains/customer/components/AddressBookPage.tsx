import React from 'react';
import { Header } from '../home/homepage/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import AddressBook from '@/components/customer/AddressBook';

/**
 * Address Book Page - Amazon.com/Shopee.sg-Level Address Management
 * Complete address management with Bangladesh locations support
 */
const AddressBookPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddressBook userId="current-user" />
      </main>
      <Footer />
    </div>
  );
};

export default AddressBookPage;