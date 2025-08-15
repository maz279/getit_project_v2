
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent } from '../../../shared/ui/card';
import { Store, TrendingUp, Users, DollarSign } from 'lucide-react';

export const VendorCTA: React.FC = () => {
  const navigate = useNavigate();

  const handleBecomeVendor = () => {
    navigate('/vendor/register');
  };

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-6xl mx-auto px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Become a GetIt Vendor</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of successful vendors on Bangladesh's fastest growing marketplace
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6 text-center">
              <Store className="w-12 h-12 mx-auto mb-3 text-white" />
              <h3 className="font-semibold text-white">Easy Setup</h3>
              <p className="text-sm text-white/80">Start selling in minutes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-white" />
              <h3 className="font-semibold text-white">Grow Sales</h3>
              <p className="text-sm text-white/80">Reach 2M+ customers</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-white" />
              <h3 className="font-semibold text-white">Support</h3>
              <p className="text-sm text-white/80">24/7 Bengali support</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-white" />
              <h3 className="font-semibold text-white">Low Fees</h3>
              <p className="text-sm text-white/80">Starting from 2%</p>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          size="lg" 
          variant="secondary" 
          onClick={handleBecomeVendor}
          className="text-lg px-8 py-3"
        >
          Start Selling Today
        </Button>
      </div>
    </section>
  );
};
