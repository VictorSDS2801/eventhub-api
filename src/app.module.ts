import { Module } from '@nestjs/common';
import { ConfigModule } from './infrastructure/shared/config/config.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
})
export class AppModule {}
