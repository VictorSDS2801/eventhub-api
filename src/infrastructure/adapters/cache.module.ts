import { Module } from '@nestjs/common';
import { ConfigModule } from '../shared/config/config.module';
import { I_CACHE } from '../../domain/ports/cache.port';
import { RedisCacheAdapter } from './redis-cache.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: I_CACHE,
      useClass: RedisCacheAdapter,
    },
  ],
  exports: [I_CACHE],
})
export class CacheModule {}
