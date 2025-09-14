import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  ArrowRight,
  DollarSign,
  Zap
} from 'lucide-react';

interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
  lineNextTransactionId?: string;
  processorTransactionId?: string;
  fees: number;
  createdAt: string;
  completedAt?: string;
}

interface PaymentProcessorProps {
  onPaymentComplete?: (paymentId: string, amount: number) => void;
  onPaymentFailed?: (paymentId: string, reason: string) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  onPaymentComplete,
  onPaymentFailed
}) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
  const [paymentDescription, setPaymentDescription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentRequest | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRequest[]>([]);

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: CreditCard,
      fee: '2.9%',
      processingTime: 'Instant',
      color: 'bg-blue-500'
    },
    {
      id: 'line_pay',
      name: 'LINE Pay',
      icon: Smartphone,
      fee: '0.5%',
      processingTime: 'Instant',
      color: 'bg-green-500'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Banknote,
      fee: '1.5%',
      processingTime: '1-3 days',
      color: 'bg-purple-500'
    }
  ];

  const calculateFees = (amount: number, method: string): number => {
    const feeRates = {
      credit_card: 0.029,
      line_pay: 0.005,
      bank_transfer: 0.015
    };
    return amount * (feeRates[method as keyof typeof feeRates] || 0.029);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayment = async () => {
    if (paymentAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment request
      const paymentRequest: PaymentRequest = {
        id: `pay_${Date.now()}`,
        amount: paymentAmount,
        currency: 'USD',
        paymentMethod: selectedMethod,
        description: paymentDescription || 'LINE YIELD Payment',
        status: 'pending',
        fees: calculateFees(paymentAmount, selectedMethod),
        createdAt: new Date().toISOString()
      };

      setCurrentPayment(paymentRequest);

      // Simulate LINE NEXT integration
      await simulateLINENextPayment(paymentRequest);

    } catch (error) {
      console.error('Payment error:', error);
      if (currentPayment) {
        setCurrentPayment({ ...currentPayment, status: 'failed' });
        onPaymentFailed?.(currentPayment.id, 'Payment processing failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateLINENextPayment = async (payment: PaymentRequest): Promise<void> => {
    // Step 1: Send to LINE NEXT
    setCurrentPayment({ ...payment, status: 'approved', lineNextTransactionId: `line_${Date.now()}` });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Process with 3rd party processor
    setCurrentPayment(prev => ({ 
      ...prev!, 
      status: 'processing', 
      processorTransactionId: `proc_${Date.now()}` 
    }));
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Complete payment
    const completedPayment = {
      ...payment,
      status: 'completed' as const,
      lineNextTransactionId: `line_${Date.now()}`,
      processorTransactionId: `proc_${Date.now()}`,
      completedAt: new Date().toISOString()
    };

    setCurrentPayment(completedPayment);
    setPaymentHistory(prev => [completedPayment, ...prev]);
    onPaymentComplete?.(completedPayment.id, completedPayment.amount);
  };

  const totalAmount = paymentAmount + calculateFees(paymentAmount, selectedMethod);

  return (
    <div className="space-y-6">
      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Make Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount (USD)
            </label>
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="text-lg"
            />
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-gray-600">Fee: {method.fee}</p>
                      <p className="text-xs text-gray-500">{method.processingTime}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <Input
              value={paymentDescription}
              onChange={(e) => setPaymentDescription(e.target.value)}
              placeholder="Payment description"
            />
          </div>

          {/* Payment Summary */}
          {paymentAmount > 0 && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>${paymentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span>${calculateFees(paymentAmount, selectedMethod).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || paymentAmount <= 0}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Process Payment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Payment Status */}
      {currentPayment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(currentPayment.status)}
              <span className="ml-2">Payment Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <Badge className={getStatusColor(currentPayment.status)}>
                  {currentPayment.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${currentPayment.amount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Fees:</span>
                <span>${currentPayment.fees.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">${(currentPayment.amount + currentPayment.fees).toFixed(2)}</span>
              </div>

              {currentPayment.lineNextTransactionId && (
                <div className="flex justify-between">
                  <span>LINE Transaction:</span>
                  <span className="text-sm text-gray-600">{currentPayment.lineNextTransactionId}</span>
                </div>
              )}

              {currentPayment.processorTransactionId && (
                <div className="flex justify-between">
                  <span>Processor Transaction:</span>
                  <span className="text-sm text-gray-600">{currentPayment.processorTransactionId}</span>
                </div>
              )}

              {/* Progress Steps */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Payment Progress</span>
                  <span className="text-sm text-gray-600">
                    {currentPayment.status === 'completed' ? '100%' : 
                     currentPayment.status === 'processing' ? '75%' :
                     currentPayment.status === 'approved' ? '50%' : '25%'}
                  </span>
                </div>
                <Progress 
                  value={
                    currentPayment.status === 'completed' ? 100 : 
                    currentPayment.status === 'processing' ? 75 :
                    currentPayment.status === 'approved' ? 50 : 25
                  } 
                  className="h-2"
                />
                
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Request</span>
                  <span>LINE NEXT</span>
                  <span>Processor</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{payment.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentProcessor;

