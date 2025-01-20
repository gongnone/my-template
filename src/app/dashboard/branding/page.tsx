'use client';

import { useState } from 'react';

interface BrandingData {
  companyName: string;
  brandVoice: string;
  brandValues: string;
  targetAudience: string;
  uniqueSellingProposition: string;
  brandPersonality: string;
  colorScheme: string;
  typography: string;
  visualStyle: string;
  brandStory: string;
}

export default function BrandingPage() {
  const [brandingData, setBrandingData] = useState<BrandingData>({
    companyName: '',
    brandVoice: '',
    brandValues: '',
    targetAudience: '',
    uniqueSellingProposition: '',
    brandPersonality: '',
    colorScheme: '',
    typography: '',
    visualStyle: '',
    brandStory: '',
  });

  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickFill = async () => {
    if (!description.trim()) {
      alert('Please enter a description first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/openai/generate-branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      setBrandingData(prev => ({
        ...prev,
        ...data,
      }));
    } catch (error) {
      console.error('Error generating branding:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate branding. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save to localStorage for now
      localStorage.setItem('brand-guidelines', JSON.stringify(brandingData));
      alert('Brand Guidelines saved successfully!');
    } catch (error) {
      console.error('Error saving brand guidelines:', error);
      alert('Error saving brand guidelines. Please try again.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBrandingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Brand Guidelines</h1>
      </div>

      {/* Quick Fill Section */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Quick Fill with AI</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your brand
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              placeholder="Example: A modern tech startup focused on AI-powered productivity tools for remote teams, with a friendly and professional approach..."
            />
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            disabled={isGenerating}
            className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Brand Guidelines'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="bg-[#1F2023] rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Company Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name*
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="companyName"
                  value={brandingData.companyName}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white pr-20"
                  required
                  placeholder="Enter your company name"
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.companyName)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand Story
              </label>
              <div className="relative">
                <textarea
                  name="brandStory"
                  value={brandingData.brandStory}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px] pr-20"
                  placeholder="Share your brand's story and history..."
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.brandStory)}
                  className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Voice & Personality */}
        <div className="bg-[#1F2023] rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Brand Voice & Personality</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand Voice*
              </label>
              <div className="relative">
                <textarea
                  name="brandVoice"
                  value={brandingData.brandVoice}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px] pr-20"
                  required
                  placeholder="Describe your brand's voice and tone..."
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.brandVoice)}
                  className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand Values*
              </label>
              <div className="relative">
                <textarea
                  name="brandValues"
                  value={brandingData.brandValues}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px] pr-20"
                  required
                  placeholder="List your core brand values..."
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.brandValues)}
                  className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand Personality*
              </label>
              <div className="relative">
                <textarea
                  name="brandPersonality"
                  value={brandingData.brandPersonality}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px] pr-20"
                  required
                  placeholder="Describe your brand's personality traits..."
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.brandPersonality)}
                  className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Target Audience & Positioning */}
        <div className="bg-[#1F2023] rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Target Audience & Positioning</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Audience*
              </label>
              <div className="relative">
                <textarea
                  name="targetAudience"
                  value={brandingData.targetAudience}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px] pr-20"
                  required
                  placeholder="Describe your target audience..."
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.targetAudience)}
                  className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Unique Selling Proposition*
              </label>
              <div className="relative">
                <textarea
                  name="uniqueSellingProposition"
                  value={brandingData.uniqueSellingProposition}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px] pr-20"
                  required
                  placeholder="What makes your brand unique..."
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.uniqueSellingProposition)}
                  className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Identity */}
        <div className="bg-[#1F2023] rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Visual Identity</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Color Scheme
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="colorScheme"
                  value={brandingData.colorScheme}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white pr-20"
                  placeholder="Describe your brand's color palette"
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.colorScheme)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Typography
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="typography"
                  value={brandingData.typography}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white pr-20"
                  placeholder="List your brand's fonts"
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.typography)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Visual Style
              </label>
              <div className="relative">
                <textarea
                  name="visualStyle"
                  value={brandingData.visualStyle}
                  onChange={handleInputChange}
                  className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px] pr-20"
                  placeholder="Describe your brand's visual style guidelines..."
                />
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(brandingData.visualStyle)}
                  className="absolute right-2 top-2 px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-grow bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700"
          >
            Save Brand Guidelines
          </button>
        </div>
      </form>
    </div>
  );
} 