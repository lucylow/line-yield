import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService, PaymentLockRequest } from '@/services/PaymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const lockRequest: PaymentLockRequest = req.body;

    // Verify webhook signature in production
    const signature = req.headers['x-line-signature'] as string;
    if (!paymentService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle the payment lock
    await paymentService.handlePaymentLock(lockRequest);

    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Payment lock callback error:', error);
    
    res.status(500).json({
      error: 'Failed to handle payment lock',
      message: error.message || 'Internal server error'
    });
  }
}

