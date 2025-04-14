import { Controller, Post, Body, Headers, HttpException, HttpStatus, Inject, OnModuleInit, Query } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Controller('analyze')
export class AnalysisController implements OnModuleInit {
  constructor(
    @InjectQueue('analysis') private readonly analysisQueue: Queue
  ) {}

  @Post()
  async analyze(
    @Body('conversation_id') conversationId: string,
    @Headers('x-zapwise-secret') secret: string,
    @Query('immediate') immediate?: string
  ) {
    
    if (!conversationId) {
      throw new HttpException('conversation_id obrigatório', HttpStatus.BAD_REQUEST);
    }

    if (secret !== process.env.WORKER_SECRET) {
      throw new HttpException('Não autorizado', HttpStatus.UNAUTHORIZED);
    }

    const TEN_MIN = 10 * 60 * 1000;
    const delay = immediate === 'true' ? 0 : TEN_MIN;

    await this.analysisQueue.add('analyze-conversation', { conversationId, immediate: immediate === 'true' }, {
      delay,
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false,
    });

    return { success: true, message: immediate === 'true' ? 'Análise adicionada na fila' :'Análise na fila e agendada para daqui 10 minutos' };
  }

  onModuleInit() {
    this.analysisQueue.on('error', (err) => {
      console.error('❌ Erro na fila "analysis":', err);
    });

    this.analysisQueue.on('failed', (job, err) => {
      console.error(`💥 Job ${job.id} falhou:`, err);
    });

    this.analysisQueue.on('waiting', (jobId) => {
      console.log(`⏳ Job aguardando execução: ${jobId}`);
    });

    this.analysisQueue.on('active', (job) => {
      console.log(`▶️ Executando job ${job.id}`);
    });

    this.analysisQueue.on('completed', (job) => {
      console.log(`✅ Job ${job.id} finalizado`);
    });
  }
}
