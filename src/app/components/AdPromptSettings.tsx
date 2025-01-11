'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface PromptTemplate {
  basePrompt: string;
  leadGenTemplate: string;
  conversionTemplate: string;
  styleTemplates: {
    [key: string]: {
      description: string;
      guidelines: string;
    };
  };
}

const defaultPromptTemplate: PromptTemplate = {
  basePrompt: "You are an expert Facebook ad copywriter. Create a Facebook {adType} ad with these details:",
  leadGenTemplate: `Style: {style}
Call to Action: {callToAction}
Target Market: {targetMarket}
Product: {specificFeatures}
Pain Points: {painPoints}
Benefits: {benefits}
Description: {productDescription}
Story: {theStory}
Key Benefits: {listBenefits}
Technical Details: {specificTerms}
Studies: {studiesAndResearch}
Authority: {credibleAuthority}
Press Features: {pressInfo}
Reviews: {numberOfReviews} reviews with {averageStarRating} average rating
Example Review: {fiveStarText}`,
  conversionTemplate: `Style: {style}
Call to Action: {callToAction}
Target Market: {targetMarket}
Product: {specificFeatures}
Pain Points: {painPoints}
Benefits: {benefits}
Description: {productDescription}
Story: {theStory}
Key Benefits: {listBenefits}
Technical Details: {specificTerms}
Studies: {studiesAndResearch}
Authority: {credibleAuthority}
Press Features: {pressInfo}
Reviews: {numberOfReviews} reviews with {averageStarRating} average rating
Example Review: {fiveStarText}
Regular Price: {regularPrice}
Sale Price: {salePrice}
Discount: {discountPercentage}%
Deadline: {offerDeadline}
Bonuses: {bonusItems}
Guarantee: {guarantee}
Shipping: {shipping}`,
  styleTemplates: {
    'hero': {
      description: 'A bold, attention-grabbing ad that positions the product as the hero solution',
      guidelines: 'Focus on the transformative power of the product\nUse strong, confident language\nHighlight key benefits immediately'
    },
    'social_proof': {
      description: 'Leverage testimonials and social validation',
      guidelines: 'Lead with impressive numbers\nFeature specific customer results\nInclude authority markers'
    }
  }
};

export default function AdPromptSettings() {
  const [promptTemplate, setPromptTemplate] = useLocalStorage<PromptTemplate>(
    'ad-prompt-template',
    defaultPromptTemplate
  );
  const [activeTab, setActiveTab] = useState<'base' | 'lead-gen' | 'conversion' | 'styles'>('base');
  const [selectedStyle, setSelectedStyle] = useState<string>('hero');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate>(promptTemplate);

  const handleSave = () => {
    setPromptTemplate(editingTemplate);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditingTemplate(defaultPromptTemplate);
    setPromptTemplate(defaultPromptTemplate);
    setIsEditing(false);
  };

  const renderTextArea = (
    value: string,
    onChange: (value: string) => void,
    label: string,
    placeholder: string = ''
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      <textarea
        className="w-full bg-[#2A2B2F] rounded-lg p-3 text-white min-h-[200px] resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={!isEditing}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Ad Prompt Settings</h1>
        <div className="space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white"
            >
              Edit Templates
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 text-white"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingTemplate(promptTemplate);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-[#2A2B2F] rounded-lg hover:bg-[#3A3B3F] text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white"
              >
                Reset to Default
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        {(['base', 'lead-gen', 'conversion', 'styles'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 ${
              activeTab === tab
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'base' && (
          renderTextArea(
            editingTemplate.basePrompt,
            (value) => setEditingTemplate({ ...editingTemplate, basePrompt: value }),
            'Base Prompt Template',
            'Enter the base prompt template...'
          )
        )}

        {activeTab === 'lead-gen' && (
          renderTextArea(
            editingTemplate.leadGenTemplate,
            (value) => setEditingTemplate({ ...editingTemplate, leadGenTemplate: value }),
            'Lead Generation Template',
            'Enter the lead generation template...'
          )
        )}

        {activeTab === 'conversion' && (
          renderTextArea(
            editingTemplate.conversionTemplate,
            (value) => setEditingTemplate({ ...editingTemplate, conversionTemplate: value }),
            'Conversion Template',
            'Enter the conversion template...'
          )
        )}

        {activeTab === 'styles' && (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 space-y-4">
              <h3 className="font-medium text-white">Styles</h3>
              <div className="space-y-2">
                {Object.keys(editingTemplate.styleTemplates).map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      selectedStyle === style
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#2A2B2F] text-gray-400 hover:text-white hover:bg-[#3A3B3F]'
                    }`}
                  >
                    {style.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                ))}
                {isEditing && (
                  <button
                    onClick={() => {
                      const newStyle = prompt('Enter new style name (use_underscores):');
                      if (newStyle) {
                        setEditingTemplate({
                          ...editingTemplate,
                          styleTemplates: {
                            ...editingTemplate.styleTemplates,
                            [newStyle]: {
                              description: '',
                              guidelines: ''
                            }
                          }
                        });
                        setSelectedStyle(newStyle);
                      }
                    }}
                    className="w-full px-3 py-2 bg-green-600 rounded-lg hover:bg-green-700 text-white"
                  >
                    + Add Style
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-3 space-y-6">
              {selectedStyle && (
                <>
                  {renderTextArea(
                    editingTemplate.styleTemplates[selectedStyle].description,
                    (value) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        styleTemplates: {
                          ...editingTemplate.styleTemplates,
                          [selectedStyle]: {
                            ...editingTemplate.styleTemplates[selectedStyle],
                            description: value
                          }
                        }
                      }),
                    'Style Description',
                    'Enter a description for this style...'
                  )}
                  {renderTextArea(
                    editingTemplate.styleTemplates[selectedStyle].guidelines,
                    (value) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        styleTemplates: {
                          ...editingTemplate.styleTemplates,
                          [selectedStyle]: {
                            ...editingTemplate.styleTemplates[selectedStyle],
                            guidelines: value
                          }
                        }
                      }),
                    'Style Guidelines',
                    'Enter guidelines for this style...'
                  )}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newTemplates = { ...editingTemplate.styleTemplates };
                        delete newTemplates[selectedStyle];
                        setEditingTemplate({
                          ...editingTemplate,
                          styleTemplates: newTemplates
                        });
                        setSelectedStyle(Object.keys(newTemplates)[0]);
                      }}
                      className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white"
                    >
                      Delete Style
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 