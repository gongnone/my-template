import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { vector, topK = 5, namespace = 'ad-database' } = await req.json();

    if (!vector) {
      return NextResponse.json(
        { error: 'Vector is required' },
        { status: 400 }
      );
    }

    console.log('Querying Pinecone with:', {
      indexName: 'ad-database',
      namespace,
      topK,
      vectorLength: vector.length
    });

    const index = pinecone.index('ad-database');
    
    const queryResponse = await index.query({
      vector,
      topK,
      includeMetadata: true,
      filter: { namespace }
    });

    console.log('Pinecone query response:', {
      matchCount: queryResponse.matches?.length || 0
    });

    return NextResponse.json({
      matches: queryResponse.matches || []
    });

  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error querying vectors' },
      { status: 500 }
    );
  }
} 