import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { EmailService } from 'src/email/email.service';
import { MetaPixelModule } from 'src/meta-pixel/meta-pixel.module';

@Module({
  imports: [MetaPixelModule],
  providers: [StripeService, EmailService],
  controllers: [StripeController],
})
export class StripeModule {}
