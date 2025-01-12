import { seedPineconeWithAds, clearPineconeNamespace } from '@/lib/utils/seedPinecone';

async function main() {
  try {
    // First clear the existing vectors
    await clearPineconeNamespace();
    
    // Then seed with sample ads
    await seedPineconeWithAds();
  } catch (error) {
    console.error('Error in seeding script:', error);
    process.exit(1);
  }
}

main(); 