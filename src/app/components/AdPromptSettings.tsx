'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface StyleTemplate {
  description: string;
  guidelines: string;
  category: 'lead-gen' | 'conversion';
}

interface PromptTemplate {
  basePrompt: string;
  leadGenTemplate: string;
  conversionTemplate: string;
  styleTemplates: {
    [key: string]: StyleTemplate;
  };
}

export const defaultPromptTemplate: PromptTemplate = {
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
      guidelines: 'Focus on the transformative power of the product\nUse strong, confident language\nHighlight key benefits immediately',
      category: 'lead-gen'
    },
    'weird_authority': {
      description: 'Present unconventional expertise or unique insights',
      guidelines: 'Start with an unexpected fact or claim\nEstablish authority through specific expertise\nCreate curiosity through unusual connections',
      category: 'lead-gen'
    },
    'secret_info': {
      description: 'Present exclusive or little-known information',
      guidelines: 'Hint at insider knowledge\nCreate curiosity gaps\nEmphasize exclusivity of the information',
      category: 'lead-gen'
    },
    'commitment': {
      description: 'Build on existing beliefs and commitments',
      guidelines: 'Reference common beliefs or behaviors\nShow how your solution aligns with their values\nUse consistency principle',
      category: 'lead-gen'
    },
    'ancient_story': {
      description: 'Connect historical wisdom with modern solutions',
      guidelines: 'Start with an intriguing historical reference\nBridge to current problem\nReveal the timeless solution',
      category: 'lead-gen'
    },
    'crush': {
      description: 'Position against common ineffective solutions',
      guidelines: 'Identify common misconceptions\nShow why traditional approaches fail\nPresent your superior solution',
      category: 'lead-gen'
    },
    'pas': {
      description: 'Problem, Agitate, Solve framework',
      guidelines: 'Clearly state the problem\nAmplify the pain points\nPresent your solution as the relief',
      category: 'lead-gen'
    },
    'timeline': {
      description: 'Show progression and transformation over time',
      guidelines: 'Establish the before state\nShow key transformation points\nHighlight the after results',
      category: 'lead-gen'
    },
    'social_proof': {
      description: 'Leverage testimonials and social validation',
      guidelines: 'Lead with impressive numbers\nFeature specific customer results\nInclude authority markers and testimonials',
      category: 'conversion'
    },
    'limited_time': {
      description: 'Create urgency through time-limited offers',
      guidelines: 'Emphasize scarcity\nClear deadline\nCompelling time-sensitive offer',
      category: 'conversion'
    },
    'price_comparison': {
      description: 'Show value through price comparisons',
      guidelines: 'Compare to alternatives\nHighlight cost savings\nDemonstrate superior value',
      category: 'conversion'
    },
    'before_after': {
      description: 'Showcase transformation and results',
      guidelines: 'Clear before state\nDramatic transformation\nCompelling after results',
      category: 'conversion'
    },
    'product_demo': {
      description: 'Demonstrate product features and benefits',
      guidelines: 'Show product in action\nHighlight key features\nConnect features to benefits',
      category: 'conversion'
    },
    'bundle_deal': {
      description: 'Present value-packed bundle offers',
      guidelines: 'Stack valuable items\nShow total value\nHighlight savings',
      category: 'conversion'
    },
    'seasonal': {
      description: 'Tie offer to seasonal or holiday themes',
      guidelines: 'Connect to current season/holiday\nCreate timely urgency\nThemed messaging',
      category: 'conversion'
    },
    'flash_sale': {
      description: 'Create extreme urgency with flash offers',
      guidelines: 'Very short time window\nDeep discount\nClear countdown elements',
      category: 'conversion'
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
  const [styleFilter, setStyleFilter] = useState<'all' | 'lead-gen' | 'conversion'>('all');

  const filteredStyles = Object.entries(editingTemplate.styleTemplates).filter(([_, style]) => {
    if (styleFilter === 'all') return true;
    return style.category === styleFilter;
  });

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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Filter Styles</label>
                <select
                  className="w-full bg-[#2A2B2F] rounded-lg p-2 text-white"
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value as 'all' | 'lead-gen' | 'conversion')}
                >
                  <option value="all">All Styles</option>
                  <option value="lead-gen">Lead Generation</option>
                  <option value="conversion">Conversion</option>
                </select>
              </div>

              <h3 className="font-medium text-white">Styles</h3>
              <div className="space-y-2">
                {filteredStyles.map(([style, template]) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${
                      selectedStyle === style
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#2A2B2F] text-gray-400 hover:text-white hover:bg-[#3A3B3F]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{style.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                      <span className={`text-xs ${template.category === 'lead-gen' ? 'text-blue-400' : 'text-green-400'}`}>
                        {template.category === 'lead-gen' ? 'Lead' : 'Conv'}
                      </span>
                    </div>
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
                              guidelines: '',
                              category: 'lead-gen'
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
                  <div className="flex justify-between items-center mb-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">Category</label>
                      <select
                        className="bg-[#2A2B2F] rounded-lg p-2 text-white"
                        value={editingTemplate.styleTemplates[selectedStyle].category}
                        onChange={(e) => {
                          const category = e.target.value as 'lead-gen' | 'conversion';
                          const updatedTemplates = {
                            ...editingTemplate.styleTemplates,
                            [selectedStyle]: {
                              ...editingTemplate.styleTemplates[selectedStyle],
                              category
                            }
                          };
                          
                          setEditingTemplate({
                            ...editingTemplate,
                            styleTemplates: updatedTemplates
                          });

                          // Immediately save changes if not in editing mode
                          if (!isEditing) {
                            setPromptTemplate({
                              ...promptTemplate,
                              styleTemplates: updatedTemplates
                            });
                          }
                        }}
                        disabled={!isEditing}
                      >
                        <option value="lead-gen">Lead Generation</option>
                        <option value="conversion">Conversion</option>
                      </select>
                    </div>
                  </div>

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