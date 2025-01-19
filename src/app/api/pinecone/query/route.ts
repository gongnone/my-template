import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { vector, topK = 5, namespace } = await req.json();

    if (!vector) {
      return NextResponse.json(
        { error: 'Vector is required' },
        { status: 400 }
      );
    }

    console.log('Querying Pinecone with:', {
      indexName: 'ad-database',
      namespace: namespace || 'none',
      topK,
      vectorLength: vector.length
    });

    const index = pinecone.index('ad-database');
    
    // Only include namespace in filter if it's provided
    const queryOptions = {
      vector,
      topK,
      includeMetadata: true,
      ...(namespace ? { filter: { namespace } } : {})
    };

    console.log('Query options:', queryOptions);
    
    const queryResponse = await index.query(queryOptions);

    console.log('Pinecone query response:', {
      matchCount: queryResponse.matches?.length || 0,
      firstMatch: queryResponse.matches?.[0] ? {
        score: queryResponse.matches[0].score,
        metadata: queryResponse.matches[0].metadata
      } : null
    });

    if (!queryResponse.matches?.length) {
      console.log('No matches found, trying without namespace filter');
      // Try again without namespace filter if no results
      const retryResponse = await index.query({
        vector,
        topK,
        includeMetadata: true
      });

      console.log('Retry response:', {
        matchCount: retryResponse.matches?.length || 0,
        firstMatch: retryResponse.matches?.[0] ? {
          score: retryResponse.matches[0].score,
          metadata: retryResponse.matches[0].metadata
        } : null
      });

      return NextResponse.json({
        matches: retryResponse.matches || []
      });
    }

    return NextResponse.json({
      matches: queryResponse.matches
    });

  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error querying vectors' },
      { status: 500 }
    );
  }
} 