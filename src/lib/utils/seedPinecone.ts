import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import type { AdCreative } from '@/lib/types/ads';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Sample high-performing ads
const sampleAds: Partial<AdCreative>[] = [
  {
    id: '1',
    name: 'High CTR Lead Gen Ad',
    category: 'text',
    adContent: {
      style: 'hero',
      type: 'lead-gen',
      headline: 'Discover the Secret to 10x Productivity',
      primaryText: 'Tired of endless to-do lists? Our AI-powered productivity tool helps busy professionals get more done in less time. Join 50,000+ users who have transformed their workday.',
      description: 'Free 14-day trial - See results in 24 hours',
      industry: 'Software',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'High Converting Sales Ad',
    category: 'text',
    adContent: {
      style: 'social_proof',
      type: 'conversion',
      headline: '70% Off Premium Plan - 24 Hours Only',
      primaryText: '⭐️⭐️⭐️⭐️⭐️ "This tool saved me 15 hours per week!" - Sarah K. Join 10,000+ happy customers who have revolutionized their workflow. Limited time offer ending soon.',
      description: 'Save 70% Today - Lifetime Access Available',
      industry: 'Software',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Problem-Solution Ad',
    category: 'text',
    adContent: {
      style: 'pas',
      type: 'lead-gen',
      headline: 'Stop Losing Hours to Task Management',
      primaryText: 'Drowning in tasks? Missing deadlines? There\'s a better way. Our AI assistant handles the heavy lifting so you can focus on what matters. Used by teams at Google, Microsoft, and Amazon.',
      description: 'Watch 2-min demo - See how it works',
      industry: 'Software',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Function to get embeddings for ad content
async function getEmbeddings(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
}

// Function to seed Pinecone with sample ads
export async function seedPineconeWithAds() {
  try {
    console.log('Starting Pinecone seeding...');
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    for (const ad of sampleAds) {
      if (!ad.adContent) continue;

      // Generate embedding for ad content
      const text = `${ad.adContent.headline} ${ad.adContent.primaryText} ${ad.adContent.description}`;
      const embedding = await getEmbeddings(text);

      // Prepare vector with metadata
      const vector = {
        id: ad.id!,
        values: embedding,
        metadata: {
          content: ad,
          metrics: {
            clickThroughRate: Math.random() * 0.1, // Sample CTR between 0-10%
            conversionRate: Math.random() * 0.05, // Sample CR between 0-5%
            engagement: Math.floor(Math.random() * 1000), // Sample engagement count
            impressions: Math.floor(Math.random() * 10000), // Sample impressions
          }
        }
      };

      // Upsert to Pinecone
      await index.upsert({
        vectors: [vector],
        namespace: 'kkadtool'
      });

      console.log(`Seeded ad: ${ad.id}`);
    }

    console.log('Pinecone seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Pinecone:', error);
    throw error;
  }
}

// Function to clear all vectors from namespace
export async function clearPineconeNamespace() {
  try {
    console.log('Clearing Pinecone namespace...');
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    
    await index.deleteAll({
      namespace: 'kkadtool'
    });

    console.log('Pinecone namespace cleared successfully!');
  } catch (error) {
    console.error('Error clearing Pinecone namespace:', error);
    throw error;
  }
} 