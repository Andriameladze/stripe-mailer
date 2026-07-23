import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { json, raw } from 'body-parser';
import cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
  });

  // Railway sits in front of this app as a reverse proxy, so req.ip would
  // otherwise resolve to Railway's proxy address. Trusting the first hop lets
  // Express read the real client IP from X-Forwarded-For — this only affects
  // how req.ip is computed, it doesn't touch body parsing, so it's independent
  // of the raw-body Stripe webhook setup below.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Stripe webhook must use RAW body for signature verification
  app.use('/stripe/webhook', raw({ type: 'application/json' }));

  // CORS is only needed for the browser-facing checkout endpoint. Scoped to
  // this path (not app.enableCors() globally) so the webhook route isn't
  // exposed the same way — deliberately not '*'.
  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  app.use(
    '/checkout',
    cors({
      origin: frontendOrigin,
      methods: ['POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }),
  );

  // Normal JSON for everything else
  app.use(json());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
