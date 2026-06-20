import { Module } from '@nestjs/common';
import { ConfigModule } from './infrastructure/shared/config/config.module';
import { EventModule } from './event.module';

@Module({
  imports: [ConfigModule, EventModule],
})
export class AppModule {}
