import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { EventController } from './application/controllers/event.controller';
import { EventService } from './domain/services/event.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
