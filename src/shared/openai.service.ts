import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { follow_up_prompt_template } from './openai.prompt';
import { Message } from '@prisma/client';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async classifyConversation(messages: Message[]) {
    const prompt = follow_up_prompt_template(messages)

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    try {
      const json = JSON.parse(completion.choices[0].message.content as string);
      return json;
    } catch {
      return { status: 'pending', substatus: 'undetermined' };
    }
  }
}
