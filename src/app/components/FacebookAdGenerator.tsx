'use client';

import { Product } from '@/lib/types/product';
import { useState, type ChangeEvent } from 'react';

interface FacebookAdGeneratorProps {
  product: Product;
  onBack: () => void;
}

export default function FacebookAdGenerator({ product, onBack }: FacebookAdGeneratorProps) {
  // Initialize state with product data
  const [adStyle, setAdStyle] = useState('');
  const [callToAction, setCallToAction] = useState('');
  
  // Product Information
  const [targetMarket, setTargetMarket] = useState(product.targetMarket || '');
  const [productCategory, setProductCategory] = useState(product.category || '');
  const [specificFeatures, setSpecificFeatures] = useState(product.name || '');
  const [painPoints, setPainPoints] = useState(product.painPoints || '');
  const [benefits, setBenefits] = useState(product.uniqueSellingPoints || '');
  const [productDescription, setProductDescription] = useState(product.description || '');
  
  // Story and Benefits
  const [theStory, setTheStory] = useState(product.uniqueMechanism || ''); // Map unique mechanism to story
  const [listBenefits, setListBenefits] = useState(
    product.productFeatures ? product.productFeatures.join('\n') : ''
  );
  
  // Technical Details
  const [specificTerms, setSpecificTerms] = useState(product.methodology || '');
  const [studiesAndResearch, setStudiesAndResearch] = useState(product.scientificStudies || '');
  const [credibleAuthority, setCredibleAuthority] = useState(
    product.credibilityMarkers ? product.credibilityMarkers.join(', ') : ''
  );
  
  // Keywords and CMS
  const [showKeywords, setShowKeywords] = useState(false);
  const [keywords, setKeywords] = useState(''); // New state for keywords input
  const [cmsPassword, setCmsPassword] = useState('');
  
  // Press and Price
  const [pressInfo, setPressInfo] = useState(product.featuredInPress || '');
  
  // Review Statistics
  const [numberOfReviews, setNumberOfReviews] = useState(
    product.statistics?.reviews?.toString() || ''
  );
  const [averageStarRating, setAverageStarRating] = useState(
    product.statistics?.rating?.toString() || ''
  );
  const [totalReviews, setTotalReviews] = useState(
    product.statistics?.totalCustomers?.toString() || ''
  );
  const [fiveStarText, setFiveStarText] = useState(
    product.testimonials?.[0] || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#1F2023] rounded-xl p-6">
          {/* Product Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Product</label>
            <div className="flex gap-2">
              <div className="bg-[#2A2B2F] p-3 rounded-lg flex-grow">{product.name}</div>
              <button type="button" className="bg-purple-600 px-4 rounded-lg">
                Load from E-commerce
              </button>
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

          {/* Form Actions */}
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-grow bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700"
            >
              Create Facebook Ad
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