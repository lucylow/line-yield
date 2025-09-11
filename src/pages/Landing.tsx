import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Bot, Shield, TrendingUp, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

export const Landing = () => {
  const navigate = useNavigate();
  const { wallet, connectWallet } = useWallet();

  const handleGetStarted = async () => {
    if (!wallet.isConnected) {
      await connectWallet();
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="relative mb-12">
              <div className="w-24 h-24 gradient-hero rounded-3xl flex items-center justify-center mx-auto shadow-primary animate-pulse-glow">
                <LineChart className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-8 w-8 h-8 bg-yield rounded-full flex items-center justify-center shadow-yield">
                <TrendingUp className="w-4 h-4 text-yield-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Earn Yield on Your USDT
              </span>
              <br />
              While You Chat
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              LINE Yield lets you maximize your stablecoin earnings through automated DeFi strategies, 
              directly within LINE Messenger on Kaia blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="h-14 px-8 text-lg font-semibold shadow-primary hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <ArrowRight className="w-6 h-6 mr-2" />
                Start Earning
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-lg font-semibold border-2 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-yield mb-2">8.5%</div>
                <div className="text-sm text-muted-foreground">Current APY</div>
              </div>
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-primary mb-2">$0</div>
                <div className="text-sm text-muted-foreground">Gas Fees</div>
              </div>
              <div className="text-center animate-slide-up">
                <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Auto-Optimization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Why Choose LINE Yield?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines the power of DeFi with the convenience of LINE Messenger
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-primary">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Gasless Transactions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enjoy zero transaction fees with our gas abstraction technology. We sponsor all gas costs 
                for your deposits and withdrawals on Kaia blockchain.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-yield">
                <Bot className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Auto-Rebalancing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our smart contracts automatically move your funds to the highest-yielding strategies 
                across the Kaia ecosystem, maximizing your returns.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up">
              <div className="w-16 h-16 bg-yield rounded-2xl flex items-center justify-center mb-6 shadow-yield">
                <Shield className="w-8 h-8 text-yield-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Secure & Audited</h3>
              <p className="text-muted-foreground leading-relaxed">
                All smart contracts are thoroughly audited and built with security as the top priority. 
                Your funds are always protected with institutional-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join thousands of users already earning competitive yields on their USDT
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="h-16 px-12 text-xl font-semibold shadow-primary hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowRight className="w-6 h-6 mr-3" />
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;