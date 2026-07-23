/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import express from 'express';
import Stripe from 'stripe';
import { EmailService } from '../email/email.service';
import { MetaPixelService } from '../meta-pixel/meta-pixel.service';
import {
  getProductConfig,
  getProductConfigByProductId,
} from './product-configs';

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
      // metadata is embedded directly on the session object in the webhook
      // payload — no need to re-fetch/expand the session to read it.
      const metadata = session.metadata || {};
      const paymentLinkId = session.payment_link as string | null;

      // New flow: sessions created by POST /checkout/create-session carry
      // productId in metadata. Legacy flow: sessions from a static Payment
      // Link are matched by payment_link instead. Kept side by side during
      // the migration off Payment Links.
      const productConfig = metadata.productId
        ? getProductConfigByProductId(metadata.productId)
        : paymentLinkId
          ? getProductConfig(paymentLinkId)
          : null;

      if (!productConfig) {
        this.logger.warn(
          `checkout.session.completed with no matching product config (productId=${metadata.productId ?? 'none'}, paymentLink=${paymentLinkId ?? 'none'})`,
        );
        return res.json({ received: true });
      }

      const email = session.customer_details?.email || session.customer_email;

      if (email) {
        await this.email.sendEmail(email, productConfig.email);

        const amount = session.amount_total ? session.amount_total / 100 : 0;
        const currency = session.currency?.toUpperCase() || 'USD';
        const orderId = session.id;
        // eventId is minted by create-session at checkout start (crypto.randomUUID()),
        // before Stripe's session even exists — see rationale in the accompanying
        // report. Falls back to Stripe's session id for legacy Payment Link sessions,
        // which never had an eventId minted.
        const eventId = metadata.eventId || orderId;

        await this.metaPixel.sendPurchaseEvent({
          email,
          amount,
          currency,
          orderId,
          eventId,
          eventSourceUrl: session.success_url || undefined,
          // Real customer IP/UA captured client-side by create-session, not
          // req.ip/req.headers['user-agent'] here — this webhook request comes
          // from Stripe's servers, not the customer's browser.
          userAgent: metadata.userAgent || undefined,
          ipAddress: metadata.ip || undefined,
          fbc: metadata.fbc || undefined,
          fbp: metadata.fbp || undefined,
          contentName: productConfig.meta.contentName,
          contentCategory: productConfig.meta.contentCategory,
          pixelId: productConfig.meta.pixelId,
        });

        this.logger.log(
          `Processed order: ${orderId} for ${email} (${productConfig.name})`,
        );
      }
    }

    return res.json({ received: true });
  }
}
