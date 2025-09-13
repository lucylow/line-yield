import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '@/services/PaymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, status, transactionHash } = req.body;

    // Verify webhook signature in production
    const signature = req.headers['x-line-signature'] as string;
    if (!paymentService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle the payment status change
    await paymentService.handlePaymentStatusChange(paymentId, status, transactionHash);

    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Payment status callback error:', error);
    
    res.status(500).json({
      error: 'Failed to handle payment status change',
      message: error.message || 'Internal server error'
    });
  }
}

