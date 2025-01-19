'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { defaultPromptTemplate } from './AdPromptSettings';
import type { AdCreative, AdMetrics, VectorizedAd, AdContent } from '@/lib/types/ads';
import type { CustomerAvatar } from '@/lib/types/customerAvatars';

interface VectorAdGeneratorProps {
  product?: any;
  products?: any[];
  customerAvatars?: CustomerAvatar[];
  onBack?: () => void;
}

export default function VectorAdGenerator({ product, products = [], customerAvatars = [], onBack }: VectorAdGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAds, setGeneratedAds] = useState<AdCreative[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [adType, setAdType] = useState<'lead-gen' | 'conversion'>('lead-gen');
  const [promptTemplate] = useLocalStorage('ad-prompt-template', defaultPromptTemplate);
  const [searchQuery, setSearchQuery] = useState('');
  const [similarAds, setSimilarAds] = useState<VectorizedAd[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(product);
  const [selectedAvatar, setSelectedAvatar] = useState<CustomerAvatar | null>(null);
  
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
      if (!selectedStyle || !adType || !selectedAvatar) {
        throw new Error('Please select a style, ad type, and customer avatar');
      }
      console.log('Form validation passed');

      // Create search context from avatar and product
      const searchContext = [
        selectedAvatar.description,
        ...selectedAvatar.painPoints,
        ...selectedAvatar.motivations,
        selectedProduct?.description || '',
        selectedStyle,
        adType
      ].filter(Boolean).join(' ');

      // Get embeddings for search context
      console.log('Getting embeddings for search context');
      const embeddings = await getEmbeddings(searchContext);

      // Search for similar ads
      console.log('Searching for similar ads');
      const response = await fetch('/api/pinecone/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vector: embeddings,
          topK: 3,
          namespace: 'kkadtool'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to search similar ads');
      }

      const { matches } = await response.json();
      console.log('Found similar ads:', matches);

      // Use similar ads as examples for GPT to generate new ad
      const prompt = {
        style: selectedStyle,
        type: adType,
        avatar: {
          description: selectedAvatar.description,
          demographics: selectedAvatar.demographics,
          painPoints: selectedAvatar.painPoints,
          motivations: selectedAvatar.motivations,
          buyingBehavior: selectedAvatar.buyingBehavior
        },
        product: selectedProduct,
        examples: matches.map((match: any) => ({
          headline: match.content.adContent?.headline,
          primaryText: match.content.adContent?.primaryText,
          description: match.content.adContent?.description,
          metrics: match.metrics
        }))
      };

      // Call OpenAI to generate new ad
      console.log('Calling OpenAI to generate new ad');
      const openaiResponse = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an expert Facebook ad copywriter. Generate a new ad using the provided customer avatar data, product information, and successful ad examples. The ad should match the specified style and type.`
            },
            {
              role: 'user',
              content: JSON.stringify(prompt)
            }
          ]
        })
      });

      if (!openaiResponse.ok) {
        throw new Error('Failed to generate ad copy');
      }

      const generatedText = await openaiResponse.text();
      console.log('Generated text:', generatedText);

      // Parse the generated text into ad components
      const parsedAd = parseGeneratedAd(generatedText);
      
      // Create new ad object
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
          industry: selectedProduct?.category || '',
          tags: selectedAvatar ? [
            ...selectedAvatar.demographics.ageRange.split('-'),
            selectedAvatar.demographics.gender,
            ...selectedAvatar.psychographics.interests,
            ...selectedAvatar.buyingBehavior.preferredChannels
          ] : []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update state with new ad
      setGeneratedAds(prev => [newAd, ...prev]);
      setPrimaryText(parsedAd.primaryText);
      setHeadline(parsedAd.headline);
      setDescription(parsedAd.description);
      setError(null);
      console.log('Ad generated successfully');

    } catch (error) {
      console.error('Error generating ad:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate ad');
    } finally {
      setIsLoading(false);
      console.log('Generation process completed');
    }
  };

  // Update similar ads when search query changes
  useEffect(() => {
    if (searchQuery || selectedAvatar) {
      const searchText = [
        searchQuery,
        selectedAvatar?.description,
        selectedAvatar?.painPoints.join(' '),
        selectedAvatar?.motivations.join(' ')
      ].filter(Boolean).join(' ');
      
      if (searchText) {
        searchSimilarAds(searchText);
      }
    }
  }, [searchQuery, selectedAvatar]);

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
        {/* Customer Avatar Selection */}
        <div className="mb-8">
          <label className="block text-xl font-semibold text-white mb-2">Customer Avatar*</label>
          <div className="relative">
            <select
              value={selectedAvatar?.id || ''}
              onChange={(e) => {
                const avatar = customerAvatars.find(a => a.id === e.target.value);
                setSelectedAvatar(avatar || null);
                if (avatar) {
                  setSearchQuery(avatar.description);
                }
              }}
              className="w-full bg-[#2A2B2F] rounded-xl p-4 text-white appearance-none cursor-pointer text-lg"
              required
            >
              <option value="">Select a Customer Avatar</option>
              {customerAvatars.map((avatar) => (
                <option key={avatar.id} value={avatar.id}>
                  {avatar.name}
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

        {/* Avatar Details Panel */}
        {selectedAvatar && (
          <div className="mb-8 bg-[#2A2B2F] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{selectedAvatar.name} Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Demographics */}
              <div>
                <h4 className="text-purple-400 font-medium mb-2">Demographics</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Age: {selectedAvatar.demographics.ageRange}</li>
                  <li>Gender: {selectedAvatar.demographics.gender}</li>
                  <li>Location: {selectedAvatar.demographics.location}</li>
                  <li>Occupation: {selectedAvatar.demographics.occupation}</li>
                </ul>
              </div>

              {/* Psychographics */}
              <div>
                <h4 className="text-purple-400 font-medium mb-2">Interests & Values</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAvatar.psychographics.interests.map((interest, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pain Points */}
              <div>
                <h4 className="text-purple-400 font-medium mb-2">Pain Points</h4>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  {selectedAvatar.painPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* Buying Behavior */}
              <div>
                <h4 className="text-purple-400 font-medium mb-2">Buying Behavior</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Price Preference: {selectedAvatar.buyingBehavior.pricePreference}</li>
                  <li>Channels: {selectedAvatar.buyingBehavior.preferredChannels.join(', ')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

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