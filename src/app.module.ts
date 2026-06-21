import { Module } from '@nestjs/common';
import { ConfigModule } from './infrastructure/shared/config/config.module';
import { EventModule } from './event.module';
import { IdentityModule } from './identity.module';
import { EnrollmentModule } from './enrollment.module';

@Module({
  imports: [ConfigModule, EventModule, IdentityModule, EnrollmentModule],
})
export class AppModule {}
