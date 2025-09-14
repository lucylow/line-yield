import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRPayment } from '../components/QRPayment';
import { QRPaymentHistory } from '../components/QRPaymentHistory';
import { QrCode, History, BarChart3, Info } from 'lucide-react';

export const QRPaymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">QR Code Payments</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Generate QR codes for instant payments to your Line Yield vault. 
          Share payment requests with anyone, anywhere, anytime.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <QrCode className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Instant QR Generation</h3>
              <p className="text-sm text-muted-foreground">
                Create QR codes instantly for any payment amount
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <History className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor payment status in real-time with automatic updates
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold mb-2">Complete History</h3>
              <p className="text-sm text-muted-foreground">
                View and export your complete payment history
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Create Payment
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <QRPayment />
        </TabsContent>

        <TabsContent value="history">
          <QRPaymentHistory />
        </TabsContent>
      </Tabs>

      {/* Information Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How QR Code Payments Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">For Payment Creators:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Enter the payment amount and optional description</li>
                <li>Click "Generate QR Code" to create a payment session</li>
                <li>Share the QR code with the payer (scan, screenshot, or copy data)</li>
                <li>Monitor payment status in real-time</li>
                <li>Payment automatically confirms when received</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">For Payment Scanners:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Scan the QR code with a compatible wallet or app</li>
                <li>Review payment details (amount, recipient, etc.)</li>
                <li>Confirm the transaction in your wallet</li>
                <li>Payment is automatically processed and confirmed</li>
                <li>Both parties receive confirmation notifications</li>
              </ol>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Supported Features:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>USDT Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>15-minute expiry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Export history</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



