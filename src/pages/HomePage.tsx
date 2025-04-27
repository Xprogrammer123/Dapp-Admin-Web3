import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Wallet } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full bg-white/5 border border-white/10 shadow-lg rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <Wallet size={48} className="text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-white">Web3 Wallet Dashboard</h1>
        
        <p className="text-white/60 mb-8 text-center">
          Welcome to the wallet dashboard. Access your administrator panel to view wallet connections.
        </p>
        
        <div className="flex justify-center">
          <Button 
            variant="outline"
            size="lg"
            onClick={() => navigate('/admin')}
            className="w-full"
          >
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;