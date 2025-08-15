
import React from 'react';
import { Header } from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

const Settings: React.FC = () => {
  useSEO({
    title: 'Settings - GetIt Bangladesh | Account Settings',
    description: 'Manage your account settings, preferences, and privacy options on GetIt Bangladesh.',
    keywords: 'account settings, preferences, privacy, bangladesh settings'
  });

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-600 mb-4">⚙️ Settings ⚙️</h1>
            <p className="text-lg text-gray-600">Manage your account preferences</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">🔧 Account Settings 🔧</h2>
            <p className="mb-6">Customize your profile, notifications, privacy settings, and more.</p>
            <div className="text-6xl mb-4">🛠️</div>
            <p className="text-lg">Advanced settings panel coming soon!</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
