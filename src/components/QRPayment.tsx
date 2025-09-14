import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQRPayment } from '../hooks/useQRPayment';
import { useWallet } from '../hooks/useWallet';
import { VAULT_ADDRESS } from '../utils/constants';
import { 
  QrCode, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Download,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Zap
} from 'lucide-react';
import QRCodeReact from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';

interface QRPaymentProps {
  className?: string;
}

export const QRPayment: React.FC<QRPaymentProps> = ({ className }) => {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const {
    currentSession,
    paymentStatus,
    isLoading,
    error,
    isPolling,
    createPayment,
    cancelPayment,
    confirmPayment,
    clearError,
    reset,
    formatAmount,
    formatTimeRemaining,
    isExpired,
    getStatusColor,
    getStatusIcon,
  } = useQRPayment();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);

  const handleCreatePayment = async () => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPayment({
        amount,
        token: 'USDT',
        userAddress: wallet.address,
        vaultAddress: VAULT_ADDRESS,
        description: description || undefined,
        expiresInMinutes: 15,
      });

      toast({
        title: 'QR Payment Created',
        description: 'Scan the QR code to complete payment',
      });
    } catch (err) {
      console.error('Failed to create payment:', err);
    }
  };

  const handleCancelPayment = async () => {
    try {
      await cancelPayment();
      toast({
        title: 'Payment Cancelled',
        description: 'Payment session has been cancelled',
      });
    } catch (err) {
      console.error('Failed to cancel payment:', err);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await confirmPayment();
      toast({
        title: 'Payment Confirmed',
        description: 'Payment has been confirmed successfully',
      });
    } catch (err) {
      console.error('Failed to confirm payment:', err);
    }
  };

  const handleCopyQRData = () => {
    if (currentSession?.qrCodeData) {
      navigator.clipboard.writeText(currentSession.qrCodeData);
      toast({
        title: 'Copied',
        description: 'QR code data copied to clipboard',
      });
    }
  };

  const handleDownloadQR = () => {
    if (currentSession?.qrCodeData) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-payment-${currentSession.id}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const getProgressValue = () => {
    if (!currentSession) return 0;
    
    const now = Date.now();
    const total = currentSession.expiresAt - currentSession.createdAt;
    const elapsed = now - currentSession.createdAt;
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getTimeRemaining = () => {
    if (!currentSession) return '0s';
    return formatTimeRemaining(currentSession.expiresAt);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">QR Code Payment</h2>
        <p className="text-muted-foreground">
          Generate QR codes for instant payments to your vault
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Creation Form */}
      {!currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Create Payment Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDT)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (e.g., 100.50)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Payment description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreatePayment}
                disabled={isLoading || !amount || !wallet?.address}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Session Display */}
      {currentSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Payment Request
              </CardTitle>
              <Badge className={getStatusColor(currentSession.status)}>
                {getStatusIcon(currentSession.status)} {currentSession.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-medium">{formatAmount(currentSession.amount, currentSession.token)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Session ID</Label>
                <p className="font-mono text-xs">{currentSession.id.slice(0, 8)}...</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">
                  {new Date(currentSession.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Expires</Label>
                <p className="font-medium">
                  {new Date(currentSession.expiresAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Time Remaining Progress */}
            {currentSession.status === 'pending' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label className="text-muted-foreground">Time Remaining</Label>
                  <span className="font-medium">{getTimeRemaining()}</span>
                </div>
                <Progress value={getProgressValue()} className="h-2" />
              </div>
            )}

            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200">
                <QRCodeReact
                  value={currentSession.qrCodeData}
                  size={256}
                  includeMargin
                  level="M"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyQRData}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQR}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Payment Status */}
            {currentSession.status === 'paid' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Payment Received!</span>
                </div>
                {currentSession.transactionHash && (
                  <p className="text-sm text-green-600">
                    Transaction: {currentSession.transactionHash.slice(0, 10)}...
                  </p>
                )}
                {currentSession.payerAddress && (
                  <p className="text-sm text-green-600">
                    From: {currentSession.payerAddress.slice(0, 10)}...
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {currentSession.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelPayment}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTestDialog(true)}
                    className="flex-1"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Test Confirm
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                onClick={reset}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Confirmation Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Payment Confirmation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will simulate a payment confirmation for testing purposes.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  handleConfirmPayment();
                  setShowTestDialog(false);
                }}
                className="flex-1"
              >
                Confirm Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTestDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};



