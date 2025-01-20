'use client';

import { Product } from '@/lib/types/product';
import { useState, useEffect, type ChangeEvent, useRef } from 'react';
import { useCompletion } from 'ai/react';
import { useAdStyles } from '@/lib/hooks/useAdStyles';
import { generatePrompt } from '@/lib/utils/promptGenerator';
import { useAdTemplates } from '@/lib/contexts/AdTemplatesContext';

interface FacebookAdGeneratorProps {
  product: Product;
  products?: Product[];
  onBack: () => void;
}

export default function FacebookAdGenerator({ product, products = [], onBack }: FacebookAdGeneratorProps) {
  const { leadGenStyles, conversionStyles, getStyleTemplate } = useAdStyles();
  const { getExamplesForStyle, addTemplate } = useAdTemplates();
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
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [offerDeadline, setOfferDeadline] = useState('');
  const [bonusItems, setBonusItems] = useState('');
  const [guarantee, setGuarantee] = useState('');
  const [shipping, setShipping] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [adOutputs, setAdOutputs] = useState<{
    primaryText: string;
    headline: string;
    description: string;
  } | null>(null);
  const [showGeneratedView, setShowGeneratedView] = useState(false);
  const [editedOutputs, setEditedOutputs] = useState<{
    primaryText: string;
    headline: string;
    description: string;
  } | null>(null);

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/openai/chat',
    onResponse: (response) => {
      console.log('Streaming response started');
    },
    onFinish: (completion) => {
      console.log('Final completion:', completion);
      
      try {
        // Clean up the completion first
        const cleanedCompletion = completion
          .replace(/Format your response exactly like this:\s*\d\./i, '')
          .replace(/Here's a \w+ Facebook ad:/i, '')
          .trim();

        // Try to parse sections using common patterns
        const sections = {
          primaryText: '',
          headline: '',
          description: ''
        };

        // First attempt: Try to find sections by their headers
        const patterns = {
          primaryText: /(?:Primary Text|1)[:.]?\s*([^]*?)(?=(?:Headline|2|Description|3|$))/i,
          headline: /(?:Headline|2)[:.]?\s*([^]*?)(?=(?:Description|3|$))/i,
          description: /(?:Description|3)[:.]?\s*([^]*?)(?=$)/i
        };

        Object.entries(patterns).forEach(([key, pattern]) => {
          const match = cleanedCompletion.match(pattern);
          if (match) {
            sections[key as keyof typeof sections] = match[1]
              .trim()
              .replace(/\[.*?\]/g, '')
              .replace(/Your (?:primary text|headline|description) here/gi, '')
              .trim();
          }
        });

        // Validate that we have content
        if (!sections.primaryText && !sections.headline && !sections.description) {
          // Fallback: Try splitting by numbers if no sections found
          const numberSplit = cleanedCompletion.split(/\d\.\s+/);
          if (numberSplit.length >= 4) {
            [, sections.primaryText, sections.headline, sections.description] = numberSplit.map(s => s.trim());
          }
        }

        // Final validation
        if (sections.primaryText || sections.headline || sections.description) {
          console.log('Parsed sections:', sections);
          setAdOutputs(sections);
          setEditedOutputs(sections);
          setShowGeneratedView(true);
        } else {
          throw new Error('Could not parse the response format');
        }
      } catch (parseError) {
        console.error('Error parsing completion:', parseError);
        console.error('Raw completion:', completion);
        alert('Error parsing the generated content. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Completion error:', error);
      alert('Error generating ad. Please try again.');
    },
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

  // Reset adStyle when tab changes
  useEffect(() => {
    setAdStyle('');
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let templateExamples = '';
      try {
        const styleExamples = getExamplesForStyle(adStyle, activeTab);
        if (styleExamples?.examples.length) {
          templateExamples = `
Here are examples of successful ads in this style:
${styleExamples.examples.map((example: { primaryText: string; headline: string; description: string }, i: number) => `
Example ${i + 1}:
Primary Text:
${example.primaryText}

Headline:
${example.headline}

Description:
${example.description}
`).join('\n')}

Please use these examples as inspiration for tone and structure while creating a unique ad that matches this style.`;
        }
      } catch (error) {
        console.log('No templates available for this style');
      }

      const prompt = generatePrompt({
        adType: activeTab,
        adStyle,
        callToAction,
        product: selectedProduct,
        regularPrice,
        salePrice,
        discountPercentage,
        offerDeadline,
        bonusItems,
        guarantee,
        shipping,
        templateExamples
      });

      console.log('Sending prompt:', prompt); // Debug log

      await complete(prompt);
    } catch (error) {
      console.error('Error generating ad:', error);
      alert(error instanceof Error ? error.message : 'Error generating ad. Please try again.');
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

  const handleTabChange = (tab: 'lead-gen' | 'conversion') => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
      setActiveTab(tab);
      // Reset transition state after animation completes
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const getTextLength = (text: string | undefined) => text?.length || 0;

  const ChatMessage = ({ role, content, fieldContent }: { 
    role: 'user' | 'assistant'; 
    content: string;
    fieldContent?: string;
  }) => (
    <div className={`flex gap-3 ${role === 'assistant' ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex flex-col max-w-[85%] ${role === 'assistant' ? 'items-start' : 'items-end'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          role === 'assistant' 
            ? 'bg-[#2A2B2F] text-white' 
            : 'bg-purple-600 text-white'
        }`}>
          <div className="prose prose-invert max-w-none">
            {content}
          </div>
        </div>
        {fieldContent && (
          <div className="mt-2 w-full">
            <div className="bg-[#1A1B1F] border border-gray-800 rounded-xl p-4">
              <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm">
                {fieldContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ChatInterface = ({ 
    currentContent,
    onUpdateContent,
    activeField,
  }: { 
    currentContent: { primaryText: string; headline: string; description: string } | null;
    onUpdateContent: (field: 'primaryText' | 'headline' | 'description', content: string) => void;
    activeField: 'primaryText' | 'headline' | 'description';
  }) => {
    const [messages, setMessages] = useState<Array<{
      role: 'user' | 'assistant';
      content: string;
      fieldContent?: string;
    }>>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Reset messages when active field changes
    useEffect(() => {
      setMessages([{
        role: 'assistant',
        content: `I'm here to help you improve the ${activeField.replace(/([A-Z])/g, ' $1').toLowerCase()}. Here's the current content:`,
        fieldContent: currentContent?.[activeField] || ''
      }]);
    }, [activeField, currentContent]);

    const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !currentContent || isTyping) return;

      // Add user message
      const userMessage = { role: 'user' as const, content: input };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsTyping(true);

      // Prepare the prompt with context
      const prompt = `Given this Facebook ad ${activeField.replace(/([A-Z])/g, ' $1').toLowerCase()}:
"${currentContent[activeField]}"

User request: ${input}

Please help modify ONLY the ${activeField.replace(/([A-Z])/g, ' $1').toLowerCase()}, keeping in mind the character limit of ${
        activeField === 'primaryText' ? 2000 : activeField === 'headline' ? 255 : 150
      } characters.

Respond in this format:
1. Your explanation of the changes
2. The complete new text starting with "New content:"`;

      try {
        const response = await complete(prompt);
        if (response) {
          // Extract new content
          const newContent = response.match(/New content:([\s\S]*?)$/i)?.[1]?.trim();
          
          if (newContent) {
            // Add assistant message with both explanation and new content
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.split('New content:')[0].trim(),
              fieldContent: newContent
            }]);
            
            // Update only the active field
            onUpdateContent(activeField, newContent);
          } else {
            // If no new content found, just show the response
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: response
            }]);
          }
        }
      } catch (error) {
        console.error('Error processing chat message:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your request. Please try again.' 
        }]);
      } finally {
        setIsTyping(false);
      }
    };

    // Auto-resize textarea
    const handleTextareaResize = () => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
      }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    };

    // Scroll to bottom when messages update
    useEffect(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, [messages]);

    return (
      <div className="flex flex-col h-[500px] bg-[#1F2023] rounded-xl border border-gray-800">
        <div className="flex-none px-4 py-3 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white">
            Editing {activeField.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </h3>
        </div>
        
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#2A2B2F] text-white rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex-none border-t border-gray-800 p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-h-[44px] bg-[#2A2B2F] rounded-xl">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleTextareaResize();
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Suggest changes for ${activeField.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                className="w-full bg-transparent text-white rounded-xl px-4 py-3 focus:outline-none resize-none"
                style={{ maxHeight: '200px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex-none bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    );
  };

  const GeneratedView = () => {
    const [activeViewTab, setActiveViewTab] = useState<'primary-text' | 'headline' | 'description'>('primary-text');
    const [showChat, setShowChat] = useState(false);
    
    const handleRegenerate = async () => {
      try {
        let templateExamples = '';
        try {
          const styleExamples = getExamplesForStyle(adStyle, activeTab);
          if (styleExamples?.examples.length) {
            templateExamples = `
Here are examples of successful ads in this style:
${styleExamples.examples.map((example: { primaryText: string; headline: string; description: string }, i: number) => `
Example ${i + 1}:
Primary Text:
${example.primaryText}

Headline:
${example.headline}

Description:
${example.description}
`).join('\n')}

Please use these examples as inspiration for tone and structure while creating a unique ad that matches this style.`;
          }
        } catch (error) {
          console.log('No templates available for this style');
        }

        const prompt = generatePrompt({
          adType: activeTab,
          adStyle,
          callToAction,
          product: selectedProduct,
          regularPrice,
          salePrice,
          discountPercentage,
          offerDeadline,
          bonusItems,
          guarantee,
          shipping,
          templateExamples
        });

        console.log('Regenerating with prompt:', prompt);
        
        // Add a timestamp to ensure uniqueness
        const uniquePrompt = `${prompt}\n\nGenerate a unique variation. Current timestamp: ${Date.now()}`;
        await complete(uniquePrompt);
      } catch (error) {
        console.error('Error regenerating ad:', error);
        alert(error instanceof Error ? error.message : 'Error regenerating ad. Please try again.');
      }
    };

    // Map field names to their corresponding state keys
    const fieldMappings = {
      'primary-text': 'primaryText',
      'headline': 'headline',
      'description': 'description'
    } as const;

    const handleTextChange = (
      field: 'primaryText' | 'headline' | 'description',
      value: string
    ) => {
      setEditedOutputs(prev => prev ? {
        ...prev,
        [field]: value
      } : null);
    };

    const getFieldContent = (field: keyof typeof fieldMappings) => {
      return editedOutputs?.[fieldMappings[field]] || '';
    };

    const getFieldLength = (field: keyof typeof fieldMappings) => {
      return getFieldContent(field).length;
    };

    const getMaxLength = (field: keyof typeof fieldMappings) => {
      const maxLengths = {
        'primary-text': 2000,
        'headline': 255,
        'description': 150
      };
      return maxLengths[field];
    };

    const handleCopy = (field: keyof typeof fieldMappings) => {
      navigator.clipboard.writeText(getFieldContent(field));
    };

    const handleSaveToCreatives = async () => {
      if (!editedOutputs) return;
      
      try {
        const library = JSON.parse(localStorage.getItem('ad-creatives-library') || '{"creatives": {}}');
        const id = Date.now().toString();
        
        library.creatives[id] = {
          id,
          name: editedOutputs.headline,
          description: editedOutputs.description,
          category: 'text',
          adContent: {
            style: adStyle,
            type: activeTab,
            primaryText: editedOutputs.primaryText,
            headline: editedOutputs.headline,
            description: editedOutputs.description,
            industry: productCategory,
            tags: keywords.split(',').map(t => t.trim()),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        localStorage.setItem('ad-creatives-library', JSON.stringify(library));
        alert('Saved to Ad Creatives successfully!');
      } catch (error) {
        console.error('Error saving to ad creatives:', error);
        alert('Error saving to ad creatives. Please try again.');
      }
    };

    const renderField = (field: keyof typeof fieldMappings) => {
      const maxLength = getMaxLength(field);
      const currentLength = getFieldLength(field);
      const content = getFieldContent(field);
      const title = field.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const isLongText = field === 'primary-text';

      return (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">{title}</h3>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${
                currentLength > maxLength ? 'text-red-500' : 'text-gray-400'
              }`}>
                {currentLength}/{maxLength}
              </span>
              <button
                onClick={() => handleCopy(field)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Copy
              </button>
            </div>
          </div>
          <textarea
            className={`w-full bg-[#2A2B2F] p-4 rounded-lg text-white ${
              isLongText ? 'min-h-[200px] resize-y whitespace-pre-wrap' : 'resize-none'
            }`}
            value={content}
            onChange={(e) => handleTextChange(fieldMappings[field], e.target.value)}
            rows={isLongText ? undefined : 2}
          />
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Generated Facebook Ad</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGeneratedView(false)}
              className="px-4 py-2 bg-[#2A2B2F] rounded-lg text-sm hover:bg-[#3A3B3F] transition-colors"
            >
              Edit Inputs
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                showChat 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-[#2A2B2F] text-gray-400 hover:bg-[#3A3B3F]'
              }`}
            >
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleSaveToCreatives}
              className="px-4 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Save to Ad Creatives
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex justify-center w-full mb-6">
          <div className="inline-flex p-1 bg-[#2A2B2F] rounded-lg">
            {(['primary-text', 'headline', 'description'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveViewTab(tab)}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeViewTab === tab
                    ? 'bg-purple-600 text-white shadow-sm scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1F2023] rounded-xl p-6">
            <div className="space-y-8">
              {renderField(activeViewTab)}
            </div>
          </div>

          {showChat && (
            <ChatInterface
              currentContent={editedOutputs}
              onUpdateContent={handleTextChange}
              activeField={fieldMappings[activeViewTab]}
            />
          )}
        </div>
      </div>
    );
  };

  const renderAdStyleDropdown = () => {
    const styles = activeTab === 'lead-gen' ? leadGenStyles : conversionStyles;
    
    return (
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
          {styles.map((style) => (
            <option key={style} value={style}>
              {style.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
        {adStyle && getStyleTemplate(adStyle) && (
          <p className="mt-2 text-sm text-gray-400">
            {getStyleTemplate(adStyle)?.description}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showGeneratedView ? (
        <GeneratedView />
      ) : (
        <>
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
                onClick={() => handleTabChange('lead-gen')}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === 'lead-gen'
                    ? 'bg-purple-600 text-white shadow-sm scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Lead Generation
              </button>
              <button
                onClick={() => handleTabChange('conversion')}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === 'conversion'
                    ? 'bg-purple-600 text-white shadow-sm scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Conversion
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div 
              className={`bg-[#1F2023] rounded-xl p-6 transition-all duration-300 ${
                isTransitioning ? 'opacity-50 scale-[0.99] blur-[1px]' : 'opacity-100 scale-100 blur-0'
              }`}
            >
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
              {renderAdStyleDropdown()}

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
                  {activeTab === 'lead-gen' ? (
                    <>
                      <option value="download_report">Download free report</option>
                      <option value="watch_video">Watch free video training</option>
                      <option value="book_call">Book a free 30-minute call</option>
                      <option value="free_trial">Start free trial</option>
                      <option value="subscribe">Subscribe to newsletter</option>
                    </>
                  ) : (
                    <>
                      <option value="shop_now">Shop Now</option>
                      <option value="buy_now">Buy Now</option>
                      <option value="get_offer">Get Offer</option>
                      <option value="order_now">Order Now</option>
                      <option value="learn_more">Learn More</option>
                      <option value="add_to_cart">Add to Cart</option>
                      <option value="claim_discount">Claim Discount</option>
                      <option value="get_deal">Get Deal</option>
                    </>
                  )}
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

              {/* Add Conversion-specific fields */}
              {activeTab === 'conversion' && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {renderFormField("Regular Price*", regularPrice, (e) => setRegularPrice(e.target.value), "$XX.XX")}
                    {renderFormField("Sale Price*", salePrice, (e) => setSalePrice(e.target.value), "$XX.XX")}
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Offer Details</label>
                    <div className="space-y-4">
                      {renderFormField("Discount Percentage", discountPercentage, (e) => setDiscountPercentage(e.target.value), "e.g., 50")}
                      {renderFormField("Offer Deadline", offerDeadline, (e) => setOfferDeadline(e.target.value), "e.g., 24 hours only")}
                      {renderFormField("Bonus Items", bonusItems, (e) => setBonusItems(e.target.value), "List any free bonuses included", true)}
                    </div>
                  </div>

                  {renderFormField("Money-back Guarantee", guarantee, (e) => setGuarantee(e.target.value), "e.g., 30-day money-back guarantee")}
                  {renderFormField("Shipping Information", shipping, (e) => setShipping(e.target.value), "e.g., Free shipping worldwide")}
                </>
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
        </>
      )}
    </div>
  );
} 