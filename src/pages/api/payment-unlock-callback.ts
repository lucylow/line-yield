import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService, PaymentUnlockRequest } from '@/services/PaymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const unlockRequest: PaymentUnlockRequest = req.body;

    // Verify webhook signature in production
    const signature = req.headers['x-line-signature'] as string;
    if (!paymentService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle the payment unlock
    await paymentService.handlePaymentUnlock(unlockRequest);

    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('Payment unlock callback error:', error);
    
    res.status(500).json({
      error: 'Failed to handle payment unlock',
      message: error.message || 'Internal server error'
    });
  }
}

