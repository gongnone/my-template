'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { defaultPromptTemplate } from './AdPromptSettings';
import type { AdCreative, AdMetrics, VectorizedAd, AdContent } from '@/lib/types/ads';

interface VectorAdGeneratorProps {
  product?: any;
  products?: any[];
  onBack?: () => void;
}

export default function VectorAdGenerator({ product, products = [], onBack }: VectorAdGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAds, setGeneratedAds] = useState<AdCreative[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [adType, setAdType] = useState<'lead-gen' | 'conversion'>('lead-gen');
  const [promptTemplate] = useLocalStorage('ad-prompt-template', defaultPromptTemplate);
  const [searchQuery, setSearchQuery] = useState('');
  const [similarAds, setSimilarAds] = useState<VectorizedAd[]>([]);

  // Function to get embeddings from OpenAI API
  const getEmbeddings = async (text: string): Promise<number[]> => {
    try {
      const response = await fetch('/api/openai/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to get embeddings');
      
      const data = await response.json();
      return data.embeddings;
    } catch (error) {
      console.error('Error getting embeddings:', error);
      throw error;
    }
  };

  // Function to search similar ads using vector similarity
  const searchSimilarAds = async (query: string) => {
    try {
      setIsLoading(true);
      const queryEmbedding = await getEmbeddings(query);
      
      const response = await fetch('/api/pinecone/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vector: queryEmbedding,
          topK: 5,
          namespace: 'kkadtool'
        }),
      });

      if (!response.ok) throw new Error('Failed to search similar ads');
      
      const results = await response.json();
      setSimilarAds(results.matches);
    } catch (error) {
      console.error('Error searching similar ads:', error);
      setError('Failed to search similar ads');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to parse the generated text into ad components
  const parseGeneratedAd = (text: string) => {
    console.log('Parsing text:', text); // Debug log
    
    const headlines: string[] = [];
    const primaryTexts: string[] = [];
    const descriptions: string[] = [];
    
    const lines = text.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      console.log('Processing line:', line); // Debug log
      
      if (lowerLine.includes('headline:')) {
        currentSection = 'headline';
        const content = line.split(/headline:\s*/i)[1];
        if (content) headlines.push(content.trim());
      } else if (lowerLine.includes('primary text:')) {
        currentSection = 'primaryText';
        const content = line.split(/primary text:\s*/i)[1];
        if (content) primaryTexts.push(content.trim());
      } else if (lowerLine.includes('description:')) {
        currentSection = 'description';
        const content = line.split(/description:\s*/i)[1];
        if (content) descriptions.push(content.trim());
      } else if (line.trim() && currentSection) {
        switch (currentSection) {
          case 'headline':
            if (headlines.length > 0) {
              headlines[headlines.length - 1] += ' ' + line.trim();
            }
            break;
          case 'primaryText':
            if (primaryTexts.length > 0) {
              primaryTexts[primaryTexts.length - 1] += ' ' + line.trim();
            }
            break;
          case 'description':
            if (descriptions.length > 0) {
              descriptions[descriptions.length - 1] += ' ' + line.trim();
            }
            break;
        }
      }
    }

    const result = {
      headline: headlines[0] || '',
      primaryText: primaryTexts[0] || '',
      description: descriptions[0] || '',
    };

    console.log('Parsed result:', result); // Debug log
    return result;
  };

  // Function to generate new ad using OpenAI
  const generateAd = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get similar high-performing ads
      const similarHighPerformingAds = similarAds
        .filter(ad => ad.metrics.clickThroughRate > 0.02)
        .slice(0, 3);

      // Construct prompt with examples from similar ads
      const examplesContext = similarHighPerformingAds
        .map(ad => `Example (CTR: ${ad.metrics.clickThroughRate}):
Headline: ${ad.content.adContent?.headline}
Primary Text: ${ad.content.adContent?.primaryText}
Description: ${ad.content.adContent?.description}`)
        .join('\n\n');

      const styleTemplate = promptTemplate.styleTemplates[selectedStyle];
      const templateToUse = adType === 'lead-gen' 
        ? promptTemplate.leadGenTemplate 
        : promptTemplate.conversionTemplate;

      const prompt = `${promptTemplate.basePrompt}

Style Guidelines:
${styleTemplate.guidelines}

High-Performing Examples:
${examplesContext}

Template:
${templateToUse}

Please generate a Facebook ad in this exact format, keeping each label on its own line:
Headline: [The headline]
Primary Text: [The main ad copy]
Description: [The link description]`;

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate ad');
      
      const data = await response.json();
      console.log('OpenAI Response:', data); // Debug log

      if (!data.text) throw new Error('No text in response');
      
      const parsedAd = parseGeneratedAd(data.text);
      console.log('Parsed Ad:', parsedAd); // Debug log
      
      const newAd: AdCreative = {
        id: Date.now().toString(),
        name: parsedAd.headline || 'Generated Ad',
        description: parsedAd.description || '',
        category: 'text',
        adContent: {
          style: selectedStyle,
          type: adType,
          primaryText: parsedAd.primaryText || '',
          headline: parsedAd.headline || '',
          description: parsedAd.description || '',
          industry: product?.category || '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGeneratedAds(prev => [...prev, newAd]);

      // Store the new ad in vector database
      const adContent = newAd.adContent!;
      const embedding = await getEmbeddings(
        `${adContent.headline} ${adContent.primaryText} ${adContent.description}`
      );

      await fetch('/api/pinecone/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: [{
            id: newAd.id,
            values: embedding,
            metadata: {
              content: newAd,
              metrics: {
                clickThroughRate: 0,
                conversionRate: 0,
                engagement: 0,
                impressions: 0
              }
            }
          }],
          namespace: 'kkadtool'
        }),
      });

    } catch (error) {
      console.error('Error generating ad:', error);
      setError('Failed to generate ad');
    } finally {
      setIsLoading(false);
    }
  };

  // Update similar ads when search query changes
  useEffect(() => {
    if (searchQuery) {
      searchSimilarAds(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Vector-Enhanced Ad Generator</h1>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#2A2B2F] rounded-lg hover:bg-[#3A3B3F] text-white transition-colors"
          >
            Back
          </button>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-[#1F2023] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Search Similar Ads</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for similar ads..."
            className="flex-1 bg-[#2A2B2F] rounded-lg p-3 text-white"
          />
          <button
            onClick={() => searchSimilarAds(searchQuery)}
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Similar Ads Section */}
      {similarAds.length > 0 && (
        <div className="bg-[#1F2023] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Similar Ads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarAds.map((ad) => (
              <div key={ad.id} className="bg-[#2A2B2F] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-400">
                    {ad.content.adContent?.type === 'lead-gen' ? 'Lead Generation' : 'Conversion'}
                  </span>
                  <span className="text-xs text-gray-400">{ad.content.adContent?.style}</span>
                </div>
                <h3 className="font-medium text-white mb-2 line-clamp-2">
                  {ad.content.adContent?.headline}
                </h3>
                <p className="text-sm text-gray-400 mb-2 line-clamp-3">
                  {ad.content.adContent?.primaryText}
                </p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>CTR: {(ad.metrics.clickThroughRate * 100).toFixed(2)}%</span>
                  <span>Conv: {(ad.metrics.conversionRate * 100).toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generation Controls */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4">Generate New Ad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ad Type</label>
            <select
              value={adType}
              onChange={(e) => setAdType(e.target.value as 'lead-gen' | 'conversion')}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
            >
              <option value="lead-gen">Lead Generation</option>
              <option value="conversion">Conversion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Style</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
            >
              <option value="">Select a style</option>
              {Object.entries(promptTemplate.styleTemplates)
                .filter(([_, template]) => template.category === adType)
                .map(([style, template]) => (
                  <option key={style} value={style}>
                    {style.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={generateAd}
          disabled={isLoading || !selectedStyle}
          className="w-full px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Ad'}
        </button>
      </div>

      {/* Generated Ads Section */}
      {generatedAds.length > 0 && (
        <div className="bg-[#1F2023] rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Generated Ads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedAds.map((ad) => (
              <div key={ad.id} className="bg-[#2A2B2F] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-purple-400">
                    {ad.adContent?.type === 'lead-gen' ? 'Lead Generation' : 'Conversion'}
                  </span>
                  <span className="text-xs text-gray-400">{ad.adContent?.style}</span>
                </div>

                {/* Ad Content */}
                <div className="space-y-4 mb-4">
                  {/* Headline */}
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Headline</h4>
                    <p className="text-white font-medium">
                      {ad.adContent?.headline || 'No headline'}
                    </p>
                  </div>

                  {/* Primary Text */}
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Primary Text</h4>
                    <p className="text-white text-sm line-clamp-3">
                      {ad.adContent?.primaryText || 'No primary text'}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Description</h4>
                    <p className="text-white text-sm">
                      {ad.adContent?.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Generated: {new Date(ad.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => {
                      const content = `Headline: ${ad.adContent?.headline}\n\nPrimary Text: ${ad.adContent?.primaryText}\n\nDescription: ${ad.adContent?.description}`;
                      navigator.clipboard.writeText(content);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Copy All
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 