/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import express from 'express';
import Stripe from 'stripe';
import { EmailService } from '../email/email.service';

@Controller('stripe')
export class StripeController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(private readonly email: EmailService) {}

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
        await this.email.sendEmail(email);
      }
    }

    return res.json({ received: true });
  }
}
