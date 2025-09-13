import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Globe, 
  ArrowRight, 
  CheckCircle,
  Wallet,
  Users,
  Zap,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MiniDappDemo: React.FC = () => {
  const navigate = useNavigate();

  const lineFlow = [
    { step: 1, title: 'Access Mini Dapp (LIFF)', description: 'Open in LINE Messenger', icon: MessageSquare, completed: true },
    { step: 2, title: 'Consent to Channel', description: 'User consent required', icon: CheckCircle, completed: true },
    { step: 3, title: 'Add Official Account', description: 'Add LINE official account', icon: Users, completed: true },
    { step: 4, title: 'Play Mini Dapp', description: 'Explore without wallet', icon: Zap, completed: true },
    { step: 5, title: 'Wallet Connect', description: 'Connect when needed', icon: Wallet, completed: false }
  ];

  const webFlow = [
    { step: 1, title: 'Access Mini Dapp (Web)', description: 'Open in web browser', icon: Globe, completed: true },
    { step: 2, title: 'Wallet Connect', description: 'Connect immediately', icon: Wallet, completed: true },
    { step: 3, title: 'Play Mini Dapp', description: 'Full functionality', icon: Zap, completed: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Mini Dapp User Flows</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Compare the LINE version (deferred wallet connection) and Web version (immediate wallet connection) 
            following LINE's official Mini Dapp guidelines.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* LINE Version */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">LINE Version</CardTitle>
              <p className="text-muted-foreground">
                Deferred wallet connection flow optimized for LINE Messenger
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {lineFlow.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">{item.step}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Reduces early drop-off</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Progressive disclosure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">LINE Messenger optimized</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/line-mini-dapp')}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Try LINE Version
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Web Version */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-800">Web Version</CardTitle>
              <p className="text-muted-foreground">
                Immediate wallet connection flow optimized for web browsers
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {webFlow.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">{item.step}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Immediate wallet access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Cross-platform support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Full functionality</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/web-mini-dapp')}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <Globe className="w-5 h-5 mr-2" />
                Try Web Version
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">LIFF Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Uses @line/liff SDK for LINE-specific functionality and authentication
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Mini Dapp SDK</h3>
                <p className="text-sm text-muted-foreground">
                  Custom SDK service with Kaia wallet integration functions
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Security & UX</h3>
                <p className="text-sm text-muted-foreground">
                  Follows LINE's official guidelines for optimal user experience
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="border-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MiniDappDemo;

