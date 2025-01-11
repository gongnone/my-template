import { useLocalStorage } from './useLocalStorage';

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

// Import the default template from AdPromptSettings
import { defaultPromptTemplate } from '@/app/components/AdPromptSettings';

export function useAdStyles() {
  const [promptTemplate, setPromptTemplate] = useLocalStorage<PromptTemplate>(
    'ad-prompt-template',
    defaultPromptTemplate
  );
  
  const getStylesByCategory = (category: 'lead-gen' | 'conversion') => {
    return Object.entries(promptTemplate.styleTemplates)
      .filter(([_, style]) => style.category === category)
      .map(([key]) => key);
  };

  const getStyleTemplate = (style: string): StyleTemplate | undefined => {
    return promptTemplate.styleTemplates[style];
  };

  const updateStyleCategory = (style: string, category: 'lead-gen' | 'conversion') => {
    const updatedTemplate = {
      ...promptTemplate,
      styleTemplates: {
        ...promptTemplate.styleTemplates,
        [style]: {
          ...promptTemplate.styleTemplates[style],
          category
        }
      }
    };
    setPromptTemplate(updatedTemplate);
  };

  return {
    leadGenStyles: getStylesByCategory('lead-gen'),
    conversionStyles: getStylesByCategory('conversion'),
    getStyleTemplate,
    allStyles: promptTemplate.styleTemplates,
    updateStyleCategory
  };
} 