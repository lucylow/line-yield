import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService, PaymentRequest } from '@/services/PaymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const paymentRequest: PaymentRequest = req.body;

    // Validate the payment request
    const validation = paymentService.validatePaymentRequest(paymentRequest);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid payment request',
        details: validation.errors
      });
    }

    // Create the payment
    const paymentResponse = await paymentService.createPayment(paymentRequest);

    // Return the payment response
    res.status(200).json(paymentResponse);

  } catch (error: any) {
    console.error('Payment creation error:', error);
    
    res.status(500).json({
      error: 'Failed to create payment',
      message: error.message || 'Internal server error'
    });
  }
}

