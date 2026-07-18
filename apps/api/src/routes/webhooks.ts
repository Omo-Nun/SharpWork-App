import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { verifyWebhookSignature } from '../utils/paystack';
import { PaymentStatus } from '@prisma/client';
import { notifyBookingPaid } from '../lib/booking-events';

const router = Router();

router.post('/paystack', async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['x-paystack-signature'] as string;
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body));

  if (!Buffer.isBuffer(rawBody) || !verifyWebhookSignature(rawBody, signature || '')) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  try {
    const event = JSON.parse(rawBody.toString());
    if (event.event === 'charge.success') {
      const reference = event.data?.reference as string | undefined;
      if (reference) {
        const booking = await prisma.booking.findFirst({
          where: { paystackRef: reference, deleted_at: null },
        });

        if (booking && booking.paymentStatus !== PaymentStatus.PAID) {
          const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: { paymentStatus: PaymentStatus.PAID },
          });

          notifyBookingPaid(updated.artisanId, updated.customerId, {
            id: updated.id,
            state: updated.state,
            paymentStatus: updated.paymentStatus,
            price: updated.price ?? 0,
          });
        }
      }
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
