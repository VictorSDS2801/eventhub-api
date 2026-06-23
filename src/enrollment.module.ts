import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { IdentityModule } from './identity.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { EnrollmentController } from './application/controllers/enrollment/enrollment.controller';
import { EnrollmentService } from './domain/services/enrollment/enrollment.service';

@Module({
  imports: [DatabaseModule, IdentityModule, QueueModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
})
export class EnrollmentModule {}
