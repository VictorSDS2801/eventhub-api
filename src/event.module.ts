import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { IdentityModule } from './identity.module';
import { CacheModule } from './infrastructure/adapters/cache.module';
import { EventController } from './application/controllers/event/event.controller';
import { EventService } from './domain/services/event/event.service';

@Module({
  imports: [DatabaseModule, IdentityModule, CacheModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
