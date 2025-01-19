'use client';

import { useState } from 'react';

interface CustomerAvatar {
  // Identifier
  title: string;

  // Pain Points
  mainProblem: string;
  currentFrustrations: string;
  urgencyLevel: 'low' | 'medium' | 'high';

  // Demographics
  ageRange: string;
  location: string;
  incomeLevel: string;
  familyStatus: string;

  // Motivators
  mainGoals: string;
  immediateActionTriggers: string;
  purchaseObjections: string;

  // Behavior
  informationSources: string;
  preferredContentFormat: 'video' | 'text' | 'images' | 'mixed';
  peakEngagementTime: string;
}

export default function CustomerAvatarForm() {
  const [formData, setFormData] = useState<CustomerAvatar>({
    title: '',
    mainProblem: '',
    currentFrustrations: '',
    urgencyLevel: 'medium',
    ageRange: '',
    location: '',
    incomeLevel: '',
    familyStatus: '',
    mainGoals: '',
    immediateActionTriggers: '',
    purchaseObjections: '',
    informationSources: '',
    preferredContentFormat: 'mixed',
    peakEngagementTime: '',
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
      const response = await fetch('/api/openai/generate-avatar', {
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

      setFormData(prev => ({
        ...prev,
        ...data,
        // Ensure urgencyLevel and preferredContentFormat are valid enum values
        urgencyLevel: ['low', 'medium', 'high'].includes(data.urgencyLevel) ? data.urgencyLevel : prev.urgencyLevel,
        preferredContentFormat: ['video', 'text', 'images', 'mixed'].includes(data.preferredContentFormat) 
          ? data.preferredContentFormat 
          : prev.preferredContentFormat,
      }));
    } catch (error) {
      console.error('Error generating avatar:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate avatar. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Save to localStorage for now
      const avatars = JSON.parse(localStorage.getItem('customer-avatars') || '[]');
      avatars.push({
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('customer-avatars', JSON.stringify(avatars));
      alert('Customer Avatar saved successfully!');
    } catch (error) {
      console.error('Error saving customer avatar:', error);
      alert('Error saving customer avatar. Please try again.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Fill Section */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Quick Fill with AI</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your target customer
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              placeholder="Example: A busy working mom in her 30s who wants to start a side business but struggles with time management..."
            />
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            disabled={isGenerating}
            className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Avatar Details'}
          </button>
        </div>
      </div>

      {/* Avatar Title Section */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Avatar Title</h3>
        <div>
          <label className="block text-sm font-medium mb-2">
            Give this avatar a memorable title*
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
            required
            placeholder="e.g., Tech-Savvy Working Mom, Ambitious Young Professional..."
          />
        </div>
      </div>

      {/* Pain Points Section */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Primary Pain Points</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Main Problem They're Trying to Solve*
            </label>
            <textarea
              name="mainProblem"
              value={formData.mainProblem}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              required
              placeholder="Describe the main problem your customer avatar is facing..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Current Frustrations with Existing Solutions*
            </label>
            <textarea
              name="currentFrustrations"
              value={formData.currentFrustrations}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              required
              placeholder="What frustrates them about current solutions..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Urgency Level*
            </label>
            <select
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              required
            >
              <option value="low">Low - Nice to have</option>
              <option value="medium">Medium - Important but not urgent</option>
              <option value="high">High - Urgent need</option>
            </select>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Core Demographics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Age Range*
            </label>
            <input
              type="text"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              required
              placeholder="e.g., 25-34"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Location*
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              required
              placeholder="e.g., United States, Urban areas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Income Level*
            </label>
            <input
              type="text"
              name="incomeLevel"
              value={formData.incomeLevel}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              required
              placeholder="e.g., $50,000-$75,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Family Status*
            </label>
            <input
              type="text"
              name="familyStatus"
              value={formData.familyStatus}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              required
              placeholder="e.g., Married with children"
            />
          </div>
        </div>
      </div>

      {/* Motivators Section */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Key Motivators</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Main Goals They Want to Achieve*
            </label>
            <textarea
              name="mainGoals"
              value={formData.mainGoals}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              required
              placeholder="What are their primary goals and desired outcomes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              What Would Make Them Take Immediate Action*
            </label>
            <textarea
              name="immediateActionTriggers"
              value={formData.immediateActionTriggers}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              required
              placeholder="Triggers that would make them act now..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Primary Objections to Purchasing*
            </label>
            <textarea
              name="purchaseObjections"
              value={formData.purchaseObjections}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              required
              placeholder="What might stop them from buying..."
            />
          </div>
        </div>
      </div>

      {/* Behavioral Triggers Section */}
      <div className="bg-[#1F2023] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Behavioral Triggers</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Where They Seek Information*
            </label>
            <textarea
              name="informationSources"
              value={formData.informationSources}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[100px]"
              required
              placeholder="Their preferred information sources..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Content Format*
            </label>
            <select
              name="preferredContentFormat"
              value={formData.preferredContentFormat}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              required
            >
              <option value="video">Video</option>
              <option value="text">Text</option>
              <option value="images">Images</option>
              <option value="mixed">Mixed Media</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Peak Engagement Time*
            </label>
            <input
              type="text"
              name="peakEngagementTime"
              value={formData.peakEngagementTime}
              onChange={handleInputChange}
              className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white"
              required
              placeholder="e.g., Weekday evenings, Weekend mornings"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-grow bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700"
        >
          Save Customer Avatar
        </button>
      </div>
    </form>
  );
} 