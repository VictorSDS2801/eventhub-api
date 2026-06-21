import { Module } from '@nestjs/common';
import { ConfigModule } from './infrastructure/shared/config/config.module';
import { EventModule } from './event.module';
import { IdentityModule } from './identity.module';
import { EnrollmentModule } from './enrollment.module';
import { CheckInModule } from './check-in.module';

@Module({
  imports: [
    ConfigModule,
    EventModule,
    IdentityModule,
    EnrollmentModule,
    CheckInModule,
  ],
})
export class AppModule {}
