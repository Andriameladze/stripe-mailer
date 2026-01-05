import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { raw, json } from 'body-parser';

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
