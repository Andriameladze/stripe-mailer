import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [StripeService, EmailService],
  controllers: [StripeController],
})
export class StripeModule {}
