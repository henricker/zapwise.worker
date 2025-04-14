import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../shared/openai.service';
import { AnalysisController } from './analysis.controller';
import { AnalysisProcessor } from './analysis.processor';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [BullModule.registerQueue({ name: 'analysis' })],
    providers: [AnalysisService, PrismaService, OpenAIService, AnalysisProcessor],
    controllers: [AnalysisController],
})
export class AnalysisModule {}
