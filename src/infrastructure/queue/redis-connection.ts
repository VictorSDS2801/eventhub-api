import { ConfigService } from '@nestjs/config';

export function buildRedisConnection(configService: ConfigService) {
  const url =
    configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
  const parsed = new URL(url);

  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
  };
}
