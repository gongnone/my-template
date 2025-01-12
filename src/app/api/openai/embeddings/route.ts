import { OpenAIStream } from 'ai';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new NextResponse('Text is required', { status: 400 });
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return NextResponse.json({
      embeddings: response.data[0].embedding,
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return new NextResponse('Error generating embeddings', { status: 500 });
  }
} 