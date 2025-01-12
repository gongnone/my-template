import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT!,
});

export async function POST(req: Request) {
  try {
    const { vector, topK = 5, namespace = 'ads' } = await req.json();

    if (!vector) {
      return new NextResponse('Vector is required', { status: 400 });
    }

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    
    const queryResponse = await index.query({
      vector,
      topK,
      namespace,
      includeMetadata: true,
    });

    return NextResponse.json({
      matches: queryResponse.matches,
    });
  } catch (error) {
    console.error('Error querying vectors:', error);
    return new NextResponse('Error querying vectors', { status: 500 });
  }
} 