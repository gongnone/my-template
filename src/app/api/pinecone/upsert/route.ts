import { Pinecone } from '@pinecone-database/pinecone';
import { NextResponse } from 'next/server';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { vectors, namespace } = await req.json();

    if (!vectors || !Array.isArray(vectors)) {
      return NextResponse.json(
        { error: 'Vectors array is required' },
        { status: 400 }
      );
    }

    const index = pinecone.index('ad-database');

    // Ensure vectors are in the correct format and values are regular arrays
    const records = vectors.map(vector => ({
      id: vector.id,
      values: Array.isArray(vector.values) ? vector.values : Array.from(vector.values),
      metadata: {
        ...vector.metadata,
        timestamp: new Date(vector.metadata.timestamp).toISOString()
      }
    }));

    console.log('Upserting vectors:', {
      indexName: 'ad-database',
      namespace,
      vectorCount: records.length
    });

    const upsertResponse = await index.upsert(records);

    return NextResponse.json({
      message: 'Vectors upserted successfully',
      upsertedCount: records.length
    });

  } catch (error) {
    console.error('Error upserting vectors:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upsert vectors' },
      { status: 500 }
    );
  }
} 