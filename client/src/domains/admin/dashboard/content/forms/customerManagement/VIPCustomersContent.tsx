
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { VIPStatsCards } from './vipCustomers/VIPStatsCards';
import { VIPHeader } from './vipCustomers/VIPHeader';
import { CustomersTab } from './vipCustomers/CustomersTab';
import { AnalyticsTab } from './vipCustomers/AnalyticsTab';
import { vipCustomersData, spendingTrendData, tierDistributionData } from './vipCustomers/mockData';
import { VIPCustomer, NewCustomer } from './vipCustomers/types';

export const VIPCustomersContent: React.FC = () => {
  const [customers, setCustomers] = useState<VIPCustomer[]>(vipCustomersData);
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: '',
    email: '',
    phone: '',
    tier: 'gold',
    personalShopper: 'unassigned'
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddCustomer = () => {
    const customerToAdd: VIPCustomer = {
      ...newCustomer,
      id: customers.length + 1,
      lifetimeValue: 0,
      totalOrders: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastOrder: '',
      preferredCategories: [],
      status: 'Active' as const
    };
    setCustomers([...customers, customerToAdd]);
    setNewCustomer({ name: '', email: '', phone: '', tier: 'gold', personalShopper: 'unassigned' });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'all' || customer.tier.toLowerCase() === selectedTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      <VIPHeader
        searchQuery={searchQuery}
        selectedTier={selectedTier}
        onSearchChange={handleSearch}
        onTierChange={setSelectedTier}
      />

      <VIPStatsCards customers={customers} />

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tiers">Tier Management</TabsTrigger>
          <TabsTrigger value="perks">Perks & Benefits</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <CustomersTab
            filteredCustomers={filteredCustomers}
            newCustomer={newCustomer}
            onNewCustomerChange={setNewCustomer}
            onAddCustomer={handleAddCustomer}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab
            spendingTrendData={spendingTrendData}
            tierDistributionData={tierDistributionData}
          />
        </TabsContent>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>VIP Tier Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Tier management system for VIP customers coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perks">
          <Card>
            <CardHeader>
              <CardTitle>VIP Perks & Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <p>VIP perks and benefits management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>VIP Communication Center</CardTitle>
            </CardHeader>
            <CardContent>
              <p>VIP customer communication tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered VIP Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p>AI-generated insights for VIP customer management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
