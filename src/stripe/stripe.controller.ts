/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import express from 'express';
import Stripe from 'stripe';
import { EmailService } from '../email/email.service';
import { MetaPixelService } from '../meta-pixel/meta-pixel.service';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(
    private readonly email: EmailService,
    private readonly metaPixel: MetaPixelService,
  ) {}

  @Post('webhook')
  async webhook(@Req() req: express.Request, @Res() res: express.Response) {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing signature');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        (req as any).body,
        signature as string,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      return res.status(HttpStatus.BAD_REQUEST).send(err.message);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email || session.customer_email;

      if (email) {
        // Send email with digital products
        await this.email.sendEmail(email);
        console.log('I enter here');

        // Send Meta Pixel purchase event
        const amount = session.amount_total ? session.amount_total / 100 : 0;
        const currency = session.currency?.toUpperCase() || 'USD';
        const orderId = session.id;

        await this.metaPixel.sendPurchaseEvent({
          email,
          amount,
          currency,
          orderId,
          eventSourceUrl: session.success_url || undefined,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.socket.remoteAddress,
        });

        this.logger.log(`Processed order: ${orderId} for ${email}`);
      }
    }

    return res.json({ received: true });
  }
}
