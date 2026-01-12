import { Module } from '@nestjs/common';
import { MetaPixelService } from './meta-pixel.service';

@Module({
  providers: [MetaPixelService],
  exports: [MetaPixelService],
})
export class MetaPixelModule {}
