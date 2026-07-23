/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import * as crypto from 'crypto';
import express from 'express';
import Stripe from 'stripe';
import { getProductConfigByProductId } from '../stripe/product-configs';

interface CreateSessionBody {
  productId: string;
  fbc?: string;
  fbp?: string;
}

@Controller('checkout')
export class CheckoutController {
  private readonly logger = new Logger(CheckoutController.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  @Post('create-session')
  async createSession(
    @Req() req: express.Request,
    @Body() body: CreateSessionBody,
    @Res() res: express.Response,
  ) {
    const { productId, fbc, fbp } = body || ({} as CreateSessionBody);

    if (!productId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'productId is required' });
    }

    const productConfig = getProductConfigByProductId(productId);

    if (!productConfig || !productConfig.priceId) {
      this.logger.log(process.env.STL_PRICE_ID);
      this.logger.log(productConfig);
      this.logger.warn(`Unknown or unpriced productId: ${productId}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Unknown product' });
    }

    // This endpoint is called directly by the customer's browser, unlike the
    // Stripe webhook route — so req.ip / user-agent here are the real customer values.
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const eventId = crypto.randomUUID();

    const frontendOrigin = process.env.FRONTEND_ORIGIN;

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: productConfig.priceId, quantity: 1 }],
        // Single index.html frontend, no dedicated /success or /cancel routes —
        // redirect back to the same page with a query flag instead.
        success_url: `${frontendOrigin}/?purchase=success`,
        cancel_url: `${frontendOrigin}/?purchase=cancelled`,
        metadata: {
          fbc: fbc || '',
          fbp: fbp || '',
          ip: ipAddress,
          userAgent,
          eventId,
          productId,
        },
      });

      return res.json({ url: session.url });
    } catch (err: any) {
      this.logger.error(
        `Failed to create checkout session for productId=${productId}: ${err.message}`,
        err.stack,
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to create checkout session' });
    }
  }
}
