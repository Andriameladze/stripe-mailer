import { NestFactory } from '@nestjs/core';
import { json, raw } from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
  });

  // Stripe webhook must use RAW body for signature verification
  app.use('/stripe/webhook', raw({ type: 'application/json' }));

  // Normal JSON for everything else
  app.use(json());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
