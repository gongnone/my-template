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

interface PineconeMatch {
  id: string;
  score: number;
  values: number[];
  metadata: {
    headline: string;
    primaryText: string;
    description: string;
    style: string;
    type: string;
    industry: string;
    tags: string[];
    clickThroughRate: number;
    conversionRate: number;
    engagement: number;
    impressions: number;
    createdAt: string;
    updatedAt: string;
  };
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

  // Update product when props change
  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
    }
  }, [product]);

  // Function to search similar ads using vector similarity
  const searchSimilarAds = async (searchContext: string) => {
    try {
      console.log('Getting embeddings for search context:', searchContext);
      const queryEmbedding = await getEmbeddings(searchContext);
      
      console.log('Querying Pinecone for similar ads...');
      const response = await fetch('/api/pinecone/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vector: queryEmbedding,
          topK: 5
          // Removed namespace to search all ads
        }),
      });

      if (!response.ok) {
        console.error('Pinecone query failed:', await response.text());
        throw new Error('Failed to search similar ads');
      }
      
      const results = await response.json();
      console.log('Pinecone query results:', {
        matchCount: results.matches?.length || 0,
        firstMatch: results.matches?.[0] ? {
          score: results.matches[0].score,
          metadata: results.matches[0].metadata
        } : null
      });

      if (!results.matches?.length) {
        console.warn('No similar ads found in Pinecone');
      }

      return results.matches || [];
    } catch (error) {
      console.error('Error searching similar ads:', error);
      // Return empty array instead of throwing to allow generation to continue
      return [];
    }
  };

  // Function to parse the generated text into ad components
  const parseGeneratedAd = (text: string) => {
    console.log('Parsing text:', text);
    
    // First, split by \n\n to handle section markers
    const sections = text.split(/\n\n+/);
    
    let headline = '';
    let primaryText = '';
    let description = '';
    
    // Process each section
    sections.forEach(section => {
      const cleanSection = section.trim();
      if (cleanSection.toLowerCase().startsWith('headline:')) {
        headline = cleanSection.replace(/^headline:\s*/i, '').trim();
      }
      else if (cleanSection.toLowerCase().startsWith('primary text:')) {
        primaryText = cleanSection.replace(/^primary text:\s*/i, '').trim();
      }
      else if (cleanSection.toLowerCase().startsWith('description:')) {
        description = cleanSection.replace(/^description:\s*/i, '').trim();
      }
    });

    // Clean up any remaining special characters or extra whitespace
    headline = headline.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    primaryText = primaryText.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    description = description.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Remove any "[" or "]" characters and curly braces
    headline = headline.replace(/[\[\]{}]/g, '');
    primaryText = primaryText.replace(/[\[\]{}]/g, '');
    description = description.replace(/[\[\]{}]/g, '');

    // Validate content lengths
    if (headline.length > 40) {
      throw new Error(`Headline is too long (${headline.length} chars). Must be 40 chars or less.`);
    }
    if (primaryText.length < 150 || primaryText.length > 1900) {
      throw new Error(`Primary text must be between 150 and 1900 chars (currently ${primaryText.length}).`);
    }
    if (description.length > 100) {
      throw new Error(`Description is too long (${description.length} chars). Must be 100 chars or less.`);
    }

    console.log('Parsed result:', {
      headline: `[${headline.length} chars] ${headline}`,
      primaryText: `[${primaryText.length} chars] ${primaryText}`,
      description: `[${description.length} chars] ${description}`
    });

    return {
      headline,
      primaryText,
      description
    };
  };

  // Function to generate new ad using OpenAI
  const generateAd = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting ad generation process...');

      // Validate required fields
      if (!selectedStyle || !adType || !selectedAvatar) {
        setIsLoading(false);
        throw new Error('Please select a style, ad type, and customer avatar');
      }
      console.log('Form validation passed');

      // Get the appropriate template based on ad type
      const template = adType === 'lead-gen' ? promptTemplate.leadGenTemplate : promptTemplate.conversionTemplate;
      const styleTemplate = promptTemplate.styleTemplates[selectedStyle];

      if (!styleTemplate) {
        throw new Error('Selected style template not found');
      }

      // Create search context from avatar and product
      const searchContext = [
        selectedAvatar.description,
        ...selectedAvatar.painPoints,
        ...selectedAvatar.motivations,
        selectedProduct?.description || '',
        styleTemplate.description,
        styleTemplate.guidelines,
        adType
      ].filter(Boolean).join(' ');

      // Search for similar ads
      console.log('Searching for similar ads');
      const matches = await searchSimilarAds(searchContext);
      setSimilarAds(matches);
      console.log('Found similar ads:', matches);

      // Fill in template variables
      const filledTemplate = template
        .replace('{style}', styleTemplate.description)
        .replace('{callToAction}', adType === 'lead-gen' ? 'Sign up now' : 'Buy now')
        .replace('{targetMarket}', selectedAvatar.description)
        .replace('{specificFeatures}', selectedProduct?.description || '')
        .replace('{painPoints}', selectedAvatar.painPoints.join('\n'))
        .replace('{benefits}', selectedAvatar.motivations.join('\n'))
        .replace('{productDescription}', selectedProduct?.description || '')
        .replace('{theStory}', styleTemplate.guidelines)
        .replace('{listBenefits}', selectedAvatar.psychographics.values.join('\n'))
        .replace('{specificTerms}', selectedProduct?.category || '')
        .replace('{studiesAndResearch}', '')
        .replace('{credibleAuthority}', '')
        .replace('{pressInfo}', '')
        .replace('{numberOfReviews}', '100')
        .replace('{averageStarRating}', '4.8')
        .replace('{fiveStarText}', '"Amazing product that changed my life!"');

      // Use similar ads as examples for GPT to generate new ad
      console.log('Processing similar ads for prompt:', matches.length, 'matches found');

      const examples = matches.map((match: PineconeMatch) => ({
        headline: match.metadata.headline,
        primaryText: match.metadata.primaryText,
        description: match.metadata.description,
        metrics: {
          clickThroughRate: match.metadata.clickThroughRate,
          conversionRate: match.metadata.conversionRate
        }
      }));

      console.log('Processed examples:', {
        count: examples.length,
        firstExample: examples[0] ? {
          headline: examples[0].headline,
          metrics: examples[0].metrics
        } : null
      });

      const prompt = {
        systemPrompt: promptTemplate.basePrompt.replace('{adType}', adType),
        style: {
          name: selectedStyle,
          description: styleTemplate.description,
          guidelines: styleTemplate.guidelines
        },
        template: filledTemplate,
        avatar: {
          description: selectedAvatar.description,
          demographics: selectedAvatar.demographics,
          painPoints: selectedAvatar.painPoints,
          motivations: selectedAvatar.motivations,
          buyingBehavior: selectedAvatar.buyingBehavior,
          psychographics: selectedAvatar.psychographics
        },
        product: selectedProduct,
        examples
      };

      // Call OpenAI to generate new ad
      console.log('Calling OpenAI to generate new ad with prompt:', {
        hasExamples: examples.length > 0,
        exampleCount: examples.length,
        promptKeys: Object.keys(prompt)
      });

      const messages = [
        {
          role: 'system',
          content: `You are an expert Facebook ad copywriter. Follow these STRICT formatting rules:

1. Headline (CRITICAL):
   - MUST be 40 characters or less
   - Attention-grabbing and clear
   - No special characters or formatting
   - Will be rejected if over 40 characters

2. Primary Text:
   - 150-1900 characters
   - Detailed benefits and offer
   - Compelling story and value proposition
   - Can include multiple paragraphs

3. Description:
   - 100 characters or less
   - Clear call to action
   - Direct and actionable

4. Format Requirements:
   - Each section MUST start with section name and colon
   - Sections MUST be separated by exactly one blank line
   - No special characters like [], {}, or \\n
   - No formatting markers

5. Similar Ads Usage:
   - Use the provided similar ads as inspiration
   - Learn from their structure and style
   - Adapt successful patterns while maintaining originality
   - Consider their performance metrics

I will reject any response that doesn't meet these requirements, especially the headline length limit.`
        },
        {
          role: 'user',
          content: `Generate a high-converting Facebook ad using this template and information:

Template:
${prompt.template}

Style Guidelines:
${prompt.style.guidelines}

Customer Avatar:
${JSON.stringify(prompt.avatar, null, 2)}

Product:
${JSON.stringify(prompt.product, null, 2)}

Similar Successful Ads (Use these as examples):
${JSON.stringify(examples, null, 2)}

Format the response EXACTLY like this, with blank lines between sections:

Headline: [MUST be 40 chars or less]

Primary Text: [150-1900 chars of compelling copy]

Description: [100 chars or less call to action]`
        }
      ];

      const openaiResponse = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      if (!openaiResponse.ok) throw new Error('Failed to generate ad');

      const data = await openaiResponse.json();
      const parsedAd = parseGeneratedAd(data.text);
      
      // Create new ad object with required adContent
      const adContent: AdContent = {
        style: selectedStyle,
        type: adType,
        primaryText: parsedAd.primaryText,
        headline: parsedAd.headline,
        description: parsedAd.description,
        industry: selectedProduct?.category || '',
        tags: selectedAvatar ? [
          ...selectedAvatar.demographics.ageRange.split('-'),
          selectedAvatar.demographics.gender,
          ...selectedAvatar.psychographics.interests,
          ...selectedAvatar.buyingBehavior.preferredChannels
        ] : []
      };

      const newAd: AdCreative = {
        id: Date.now().toString(),
        name: parsedAd.headline || 'Generated Ad',
        description: parsedAd.description || '',
        category: 'text',
        adContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Log the ad content for debugging
      console.log('New ad content:', {
        headline: adContent.headline,
        primaryText: adContent.primaryText,
        description: adContent.description
      });

      // Update state with new ad
      setGeneratedAds((prev: AdCreative[]) => [newAd, ...prev]);
      setPrimaryText(adContent.primaryText);
      setHeadline(adContent.headline);
      setDescription(adContent.description);

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
                      {ad.metadata.type === 'lead-gen' ? 'Lead Generation' : 'Conversion'}
                    </span>
                    <span className="text-xs text-gray-400">{ad.metadata.style}</span>
                  </div>
                  <h3 className="font-medium text-white mb-2 line-clamp-2">
                    {ad.metadata.headline}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-3">
                    {ad.metadata.primaryText}
                  </p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>CTR: {(ad.metadata.clickThroughRate * 100).toFixed(2)}%</span>
                    <span>Conv: {(ad.metadata.conversionRate * 100).toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateAd}
          disabled={isLoading || !selectedStyle || !adType || !selectedAvatar}
          className={`px-4 py-2 rounded-lg font-medium ${
            isLoading 
              ? 'bg-purple-500/50 cursor-not-allowed' 
              : 'bg-purple-500 hover:bg-purple-600'
          } text-white transition-colors`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Ad'
          )}
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