import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { IdentityModule } from './identity.module';
import { CheckInController } from './application/controllers/check-in.controller';
import { CheckInService } from './domain/services/check-in.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [CheckInController],
  providers: [CheckInService],
})
export class CheckInModule {}
