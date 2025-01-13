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
  const [selectedProduct, setSelectedProduct] = useState<any>(product);
  
  // Add new state variables for ad content
  const [primaryText, setPrimaryText] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');

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
      console.log('Starting ad generation process...');

      // Validate required fields
      if (!selectedStyle || !adType || !primaryText || !headline || !description) {
        throw new Error('Please fill in all required fields');
      }
      console.log('Form validation passed');

      // Create the new ad object
      const newAd: AdCreative = {
        id: Date.now().toString(),
        name: headline || 'Generated Ad',
        description: description || '',
        category: 'text',
        adContent: {
          style: selectedStyle,
          type: adType,
          primaryText: primaryText || '',
          headline: headline || '',
          description: description || '',
          industry: selectedProduct?.category || '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log('Created new ad object:', newAd);

      // Get embeddings for the ad content
      try {
        const adContent = newAd.adContent;
        if (!adContent) {
          throw new Error('Ad content is missing');
        }
        console.log('Requesting embeddings for text:', `${adContent.headline} ${adContent.primaryText} ${adContent.description}`);
        
        const embeddingResponse = await fetch('/api/openai/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `${adContent.headline} ${adContent.primaryText} ${adContent.description}`
          })
        });

        if (!embeddingResponse.ok) {
          const errorText = await embeddingResponse.text();
          console.error('Embeddings API error response:', errorText);
          throw new Error(`Failed to generate embeddings: ${errorText}`);
        }

        const embedData = await embeddingResponse.json();
        console.log('Received embeddings response:', embedData);

        if (!embedData.embeddings) {
          console.error('Invalid embeddings response:', embedData);
          throw new Error('Embeddings data is missing from response');
        }

        // Save to Pinecone
        console.log('Preparing Pinecone request with embeddings');
        const storeResponse = await fetch('/api/pinecone/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vectors: [{
              id: newAd.id,
              values: embedData.embeddings,
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
          })
        });

        if (!storeResponse.ok) {
          const errorData = await storeResponse.text();
          console.error('Pinecone API error response:', errorData);
          throw new Error(`Failed to save ad to database: ${errorData}`);
        }

        const storeData = await storeResponse.json();
        console.log('Pinecone store response:', storeData);

        setGeneratedAds(prev => [newAd, ...prev]);
        setError(null);
        console.log('Ad saved successfully');

      } catch (error: unknown) {
        console.error('Detailed error saving ad:', error);
        if (error instanceof Error) {
          console.error('Error stack:', error.stack);
        }
        setError(error instanceof Error ? error.message : 'Failed to save ad');
      }

    } catch (error) {
      console.error('Top level error:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      setError(error instanceof Error ? error.message : 'Failed to generate ad');
    } finally {
      setIsLoading(false);
      console.log('Generation process completed');
    }
  };

  // Update similar ads when search query changes
  useEffect(() => {
    if (searchQuery) {
      searchSimilarAds(searchQuery);
    }
  }, [searchQuery]);

  // Update product when props change
  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
    }
  }, [product]);

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

      {/* Main Form Section */}
      <div className="bg-[#1A1B1E] rounded-xl p-8">
        {/* Product Selection */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Product*</label>
          <div className="relative">
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const newProduct = products.find(p => p.id === e.target.value);
                if (newProduct) setSelectedProduct(newProduct);
              }}
              className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white appearance-none cursor-pointer text-lg"
              required
            >
              {products.length === 0 ? (
                <option value="">No products available</option>
              ) : (
                <>
                  <option value="">MindfulBody Pro Fitness Program</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg 
                className="h-6 w-6 fill-current" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ad Style */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Ad Style*</label>
          <p className="text-gray-400 text-base mb-3">Please select what style of ad you'd like.</p>
          <div className="relative">
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white appearance-none cursor-pointer text-lg"
              required
            >
              <option value="">Select A Style</option>
              {Object.entries(promptTemplate.styleTemplates)
                .filter(([_, template]) => template.category === adType)
                .map(([style, template]) => (
                  <option key={style} value={style}>
                    {style.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg 
                className="h-6 w-6 fill-current" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ad Call To Action */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Ad Call To Action*</label>
          <p className="text-gray-400 text-base mb-3">Please select your primary call to action.</p>
          <div className="relative">
            <select
              value={adType}
              onChange={(e) => setAdType(e.target.value as 'lead-gen' | 'conversion')}
              className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white appearance-none cursor-pointer text-lg"
              required
            >
              <option value="">Select A Call To Action</option>
              <option value="lead-gen">Lead Generation</option>
              <option value="conversion">Conversion</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg 
                className="h-6 w-6 fill-current" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Target Market */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Target Market*</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busy professionals aged 30-50 who want to get fit but struggle with time..."
            className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white text-lg"
          />
        </div>

        {/* Primary Text */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Primary Text</label>
          <textarea
            value={primaryText}
            onChange={(e) => setPrimaryText(e.target.value)}
            placeholder="Enter primary ad text"
            className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white text-lg min-h-[200px] resize-y placeholder-gray-500 border border-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Headline */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Enter headline"
            className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white text-lg placeholder-gray-500 border border-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter ad description"
            className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white text-lg min-h-[120px] resize-y placeholder-gray-500 border border-gray-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Similar Ads Section */}
        {similarAds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Similar Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarAds.map((ad) => (
                <div key={ad.id} className="bg-[#2A2B2F] rounded-xl p-4">
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

        {/* Generate Button */}
        <button
          onClick={generateAd}
          disabled={isLoading || !selectedStyle}
          className="w-full px-8 py-4 bg-purple-600 rounded-xl hover:bg-purple-700 text-white transition-colors disabled:opacity-50 text-lg font-medium"
        >
          {isLoading ? 'Generating...' : 'Generate Ad'}
        </button>
      </div>

      {/* Generated Ads Section */}
      {generatedAds.length > 0 && (
        <div className="bg-[#1A1B1E] rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Generated Ads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedAds.map((ad) => (
              <div key={ad.id} className="bg-[#2A2B2F] rounded-xl p-4">
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
        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
} 