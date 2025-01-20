import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Create message array for the chat completion
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a professional Facebook ad copywriter with expertise in creating high-converting ads. Each response should be unique and creative, never repeating previous outputs. Follow the provided format exactly.'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    // Create the stream
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.9,
      max_tokens: 3000,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      stream: true,
    });

    // Convert the response into a friendly stream
    const stream = OpenAIStream(response);

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
