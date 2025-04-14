// src/analysis/analysis.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { AnalysisService } from './analysis.service';

@Processor('analysis')
export class AnalysisProcessor {
  constructor(private readonly analysisService: AnalysisService) {}

  @Process('analyze-conversation')
  async handle(job: Job<{ conversationId: string, immediate?: boolean }>) {
    const { conversationId, immediate } = job.data;
    console.log(`📥 Analisando conversa: ${conversationId}`);
    await this.analysisService.analyzeConversation(conversationId, immediate);
  }
}
