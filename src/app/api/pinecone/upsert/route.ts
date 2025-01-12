import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { vectors, namespace = 'ads' } = await req.json();

    if (!vectors || !Array.isArray(vectors)) {
      return new NextResponse('Vectors array is required', { status: 400 });
    }

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    
    await index.upsert(vectors);

    return NextResponse.json({
      message: 'Vectors upserted successfully',
    });
  } catch (error) {
    console.error('Error upserting vectors:', error);
    return new NextResponse('Error upserting vectors', { status: 500 });
  }
} 