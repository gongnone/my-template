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
    const records = vectors.map(vector => {
      // Flatten metadata into simple key-value pairs
      const metadata: Record<string, string | number | boolean | string[]> = {
        headline: vector.metadata.content.adContent?.headline || '',
        primaryText: vector.metadata.content.adContent?.primaryText || '',
        description: vector.metadata.content.adContent?.description || '',
        style: vector.metadata.content.adContent?.style || '',
        type: vector.metadata.content.adContent?.type || '',
        industry: vector.metadata.content.adContent?.industry || '',
        tags: vector.metadata.content.adContent?.tags || [],
        createdAt: vector.metadata.content.createdAt || new Date().toISOString(),
        updatedAt: vector.metadata.content.updatedAt || new Date().toISOString(),
        clickThroughRate: vector.metadata.metrics?.clickThroughRate || 0,
        conversionRate: vector.metadata.metrics?.conversionRate || 0,
        engagement: vector.metadata.metrics?.engagement || 0,
        impressions: vector.metadata.metrics?.impressions || 0
      };

      return {
        id: vector.id,
        values: Array.isArray(vector.values) ? vector.values : Array.from(vector.values),
        metadata
      };
    });

    // Upsert to Pinecone
    await index.upsert(records);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error upserting vectors:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upsert vectors' },
      { status: 500 }
    );
  }
} 