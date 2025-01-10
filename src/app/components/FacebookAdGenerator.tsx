'use client';

import { Product } from '@/lib/types/product';
import { useState, useEffect, type ChangeEvent } from 'react';
import { useCompletion } from 'ai/react';

interface FacebookAdGeneratorProps {
  product: Product;
  products?: Product[];
  onBack: () => void;
}

export default function FacebookAdGenerator({ product, products = [], onBack }: FacebookAdGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'lead-gen' | 'conversion'>('lead-gen');
  const [selectedProduct, setSelectedProduct] = useState<Product>(product);
  
  // Initialize state with product data
  const [adStyle, setAdStyle] = useState('');
  const [callToAction, setCallToAction] = useState('');
  
  // Product Information
  const [targetMarket, setTargetMarket] = useState(selectedProduct.targetMarket || '');
  const [productCategory, setProductCategory] = useState(selectedProduct.category || '');
  const [specificFeatures, setSpecificFeatures] = useState(selectedProduct.name || '');
  const [painPoints, setPainPoints] = useState(selectedProduct.painPoints || '');
  const [benefits, setBenefits] = useState(selectedProduct.uniqueSellingPoints || '');
  const [productDescription, setProductDescription] = useState(selectedProduct.description || '');
  const [theStory, setTheStory] = useState(selectedProduct.uniqueMechanism || '');
  const [listBenefits, setListBenefits] = useState(
    selectedProduct.productFeatures ? selectedProduct.productFeatures.join('\n') : ''
  );
  const [specificTerms, setSpecificTerms] = useState(selectedProduct.methodology || '');
  const [studiesAndResearch, setStudiesAndResearch] = useState(selectedProduct.scientificStudies || '');
  const [credibleAuthority, setCredibleAuthority] = useState(
    selectedProduct.credibilityMarkers ? selectedProduct.credibilityMarkers.join(', ') : ''
  );
  const [keywords, setKeywords] = useState('');
  const [showKeywords, setShowKeywords] = useState(false);
  const [cmsPassword, setCmsPassword] = useState('');
  const [pressInfo, setPressInfo] = useState(selectedProduct.featuredInPress || '');
  const [numberOfReviews, setNumberOfReviews] = useState(
    selectedProduct.statistics?.reviews?.toString() || ''
  );
  const [averageStarRating, setAverageStarRating] = useState(
    selectedProduct.statistics?.rating?.toString() || ''
  );
  const [totalReviews, setTotalReviews] = useState(
    selectedProduct.statistics?.totalCustomers?.toString() || ''
  );
  const [fiveStarText, setFiveStarText] = useState(
    selectedProduct.testimonials?.[0] || ''
  );
  const [generatedAd, setGeneratedAd] = useState('');

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/openai/chat',
  });

  // Update form when selected product changes
  useEffect(() => {
    setTargetMarket(selectedProduct.targetMarket || '');
    setProductCategory(selectedProduct.category || '');
    setSpecificFeatures(selectedProduct.name || '');
    setPainPoints(selectedProduct.painPoints || '');
    setBenefits(selectedProduct.uniqueSellingPoints || '');
    setProductDescription(selectedProduct.description || '');
    setTheStory(selectedProduct.uniqueMechanism || '');
    setListBenefits(selectedProduct.productFeatures ? selectedProduct.productFeatures.join('\n') : '');
    setSpecificTerms(selectedProduct.methodology || '');
    setStudiesAndResearch(selectedProduct.scientificStudies || '');
    setCredibleAuthority(selectedProduct.credibilityMarkers ? selectedProduct.credibilityMarkers.join(', ') : '');
    setPressInfo(selectedProduct.featuredInPress || '');
    setNumberOfReviews(selectedProduct.statistics?.reviews?.toString() || '');
    setAverageStarRating(selectedProduct.statistics?.rating?.toString() || '');
    setTotalReviews(selectedProduct.statistics?.totalCustomers?.toString() || '');
    setFiveStarText(selectedProduct.testimonials?.[0] || '');
  }, [selectedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const prompt = `Create a Facebook ${activeTab === 'lead-gen' ? 'lead generation' : 'conversion'} ad with the following details:
        Style: ${adStyle}
        Call to Action: ${callToAction}
        Target Market: ${targetMarket}
        Product: ${specificFeatures}
        Pain Points: ${painPoints}
        Benefits: ${benefits}
        Description: ${productDescription}
        Story: ${theStory}
        Key Benefits: ${listBenefits}
        Technical Details: ${specificTerms}
        Studies: ${studiesAndResearch}
        Authority: ${credibleAuthority}
        Press Features: ${pressInfo}
        Reviews: ${numberOfReviews} reviews with ${averageStarRating} average rating
        Example Review: ${fiveStarText}`;

      const response = await complete(prompt);
      if (response) {
        setGeneratedAd(response);
      }
    } catch (error) {
      console.error('Error generating ad:', error);
    }
  };

  const renderFormField = (
    label: string,
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    placeholder: string = '',
    isTextArea: boolean = false
  ) => (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">{label}</label>
      {isTextArea ? (
        <textarea
          className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <h2 className="text-xl font-semibold">Generate New Facebook Ad</h2>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center w-full">
        <div className="inline-flex p-1 bg-[#2A2B2F] rounded-lg">
          <button
            onClick={() => setActiveTab('lead-gen')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'lead-gen'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Lead Generation
          </button>
          <button
            onClick={() => setActiveTab('conversion')}
            className={`px-6 py-2.5 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'conversion'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Conversion
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#1F2023] rounded-xl p-6">
          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Product*</label>
            <div className="relative">
              <select
                className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white appearance-none cursor-pointer"
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const newProduct = products.find(p => p.id === e.target.value);
                  if (newProduct) setSelectedProduct(newProduct);
                }}
                required
              >
                {products.length === 0 ? (
                  <option value="">No products available</option>
                ) : (
                  <>
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg 
                  className="h-4 w-4 fill-current" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Ad Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Ad Style*</label>
            <p className="text-gray-400 text-sm mb-2">Please select what style of ad you'd like.</p>
            <select 
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              value={adStyle}
              onChange={(e) => setAdStyle(e.target.value)}
              required
            >
              <option value="">Select A Style</option>
              <option value="hero">Hero Ad</option>
              <option value="weird_authority">Weird Authority Ad</option>
              <option value="secret_info">A Secret Piece Of Information</option>
              <option value="commitment">Commitment And Consistency</option>
              <option value="ancient_story">Ancient Story And the Hidden Secret</option>
              <option value="crush">Crush The Competition</option>
              <option value="pas">Problem, Agitate, Solve</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>

          {/* Call To Action */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Ad Call To Action*</label>
            <p className="text-gray-400 text-sm mb-2">Please select your primary call to action.</p>
            <select 
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              required
            >
              <option value="">Select A Call To Action</option>
              <option value="download_report">Download free report</option>
              <option value="watch_video">Watch free video training</option>
              <option value="book_call">Book a free 30-minute call</option>
            </select>
          </div>

          {/* All Form Fields */}
          {renderFormField("Target Market*", targetMarket, (e) => setTargetMarket(e.target.value), "e.g. Women who like...")}
          {renderFormField("Product Category*", productCategory, (e) => setProductCategory(e.target.value), "e.g. Cosmetics")}
          {renderFormField("Specific Product Name*", specificFeatures, (e) => setSpecificFeatures(e.target.value), "The name of the product/service/brand...")}
          {renderFormField("Pain/Problem*", painPoints, (e) => setPainPoints(e.target.value), "e.g. Struggling with...", true)}
          {renderFormField("Benefits*", benefits, (e) => setBenefits(e.target.value), "e.g. Helps you...", true)}
          {renderFormField("Product Description*", productDescription, (e) => setProductDescription(e.target.value), "", true)}
          {renderFormField("The Story", theStory, (e) => setTheStory(e.target.value), "", true)}
          {renderFormField("List Benefits (one line at a time)*", listBenefits, (e) => setListBenefits(e.target.value), "e.g. 1...\n2...", true)}
          {renderFormField("Specific terms/ingredients/specifications/methodology*", specificTerms, (e) => setSpecificTerms(e.target.value), "", true)}
          {renderFormField("Studies and Research", studiesAndResearch, (e) => setStudiesAndResearch(e.target.value), "e.g. New Stanford Study shows...")}
          
          {/* Credible Authority Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Credible Authority Figure</label>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
                value={credibleAuthority}
                onChange={(e) => setCredibleAuthority(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="bg-[#2A2B2F] p-2 rounded-lg"
                  onClick={() => setShowKeywords(!showKeywords)}
                >
                  {showKeywords ? '-' : '+'}
                </button>
                <span className="text-sm text-gray-400">Show keywords</span>
              </div>
              {showKeywords && (
                <div className="bg-[#2A2B2F] p-3 rounded-lg">
                  <input
                    type="text"
                    className="w-full bg-transparent text-white"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Enter keywords"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Fields */}
          {renderFormField("CMS password", cmsPassword, (e) => setCmsPassword(e.target.value))}
          {renderFormField("Featured in Press", pressInfo, (e) => setPressInfo(e.target.value), "e.g. WSJ, CNN, Forbes & Yahoo")}

          {/* Review Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {renderFormField("Number of reviews", numberOfReviews, (e) => setNumberOfReviews(e.target.value))}
            {renderFormField("Average stars rating", averageStarRating, (e) => setAverageStarRating(e.target.value))}
          </div>
          {renderFormField("Total number of reviews of ALL TIME", totalReviews, (e) => setTotalReviews(e.target.value))}
          {renderFormField("Five star text", fiveStarText, (e) => setFiveStarText(e.target.value))}

          {/* Add the generated ad display */}
          {generatedAd && (
            <div className="bg-[#2A2B2F] p-6 rounded-xl mt-6">
              <h3 className="text-lg font-medium mb-4">Generated Facebook Ad</h3>
              <div className="whitespace-pre-wrap">{generatedAd}</div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-grow bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Create Facebook Ad'}
            </button>
            <button
              type="button"
              className="px-6 py-3 bg-[#2A2B2F] rounded-lg hover:bg-[#3A3B3F]"
              onClick={onBack}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 