import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { IdentityModule } from './identity.module';
import { EnrollmentController } from './application/controllers/enrollment.controller';
import { EnrollmentService } from './domain/services/enrollment.service';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
})
export class EnrollmentModule {}
