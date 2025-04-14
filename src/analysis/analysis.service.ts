import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAIService } from '../shared/openai.service';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openai: OpenAIService,
  ) {}

  async analyzeConversation(conversationId: string, immediate: boolean = false) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { timestamp: 'asc' }, take: 10 } },
    });

    if (!convo) return;

    if(!immediate) {
        const TEN_MIN = 10 * 60 * 1000;
        if (convo.lastAnalysisAt && new Date().getTime() - convo.lastAnalysisAt.getTime() < TEN_MIN) {
          console.log('⏱️ Ignorado (dentro da janela)');
          return;
        }
    }

    const { status, substatus } = await this.openai.classifyConversation(convo.messages);

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status,
        substatus,
        lastAnalysisAt: new Date(),
      },
    });

    console.log(`✅ Classificado: ${status} / ${substatus}`);
  }
}
