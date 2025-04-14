import { Module } from '@nestjs/common';
import { AnalysisModule } from './analysis/analysis.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      // password: process.env.REDIS_PASSWORD,
      // tls: {}
    },
  }),AnalysisModule],
})
export class AppModule {}
