import { Product } from '@/lib/types/product';

interface PromptVariables {
  adType: 'lead-gen' | 'conversion';
  adStyle: string;
  callToAction: string;
  product: Product;
  regularPrice?: string;
  salePrice?: string;
  discountPercentage?: string;
  offerDeadline?: string;
  bonusItems?: string;
  guarantee?: string;
  shipping?: string;
  templateExamples?: string;
}

export const generatePrompt = ({
  adType,
  adStyle,
  callToAction,
  product,
  regularPrice,
  salePrice,
  discountPercentage,
  offerDeadline,
  bonusItems,
  guarantee,
  shipping,
  templateExamples = ''
}: PromptVariables): string => {
  try {
    const promptTemplate = JSON.parse(localStorage.getItem('ad-prompt-template') || '{}');
    const styleTemplate = promptTemplate.styleTemplates?.[adStyle];

    // Replace variables in the template
    const replaceVariables = (template: string) => {
      return template
        .replace('{adType}', adType)
        .replace('{style}', adStyle)
        .replace('{callToAction}', callToAction)
        .replace('{targetMarket}', product.targetMarket || '')
        .replace('{specificFeatures}', product.name || '')
        .replace('{painPoints}', product.painPoints || '')
        .replace('{benefits}', product.uniqueSellingPoints || '')
        .replace('{productDescription}', product.description || '')
        .replace('{theStory}', product.uniqueMechanism || '')
        .replace('{listBenefits}', product.productFeatures?.join('\n') || '')
        .replace('{specificTerms}', product.methodology || '')
        .replace('{studiesAndResearch}', product.scientificStudies || '')
        .replace('{authority}', product.credibilityMarkers?.join(', ') || '')
        .replace('{pressInfo}', product.featuredInPress || '')
        .replace('{numberOfReviews}', product.statistics?.reviews?.toString() || '')
        .replace('{averageStarRating}', product.statistics?.rating?.toString() || '')
        .replace('{fiveStarText}', product.testimonials?.[0] || '')
        .replace('{regularPrice}', regularPrice || '')
        .replace('{salePrice}', salePrice || '')
        .replace('{discountPercentage}', discountPercentage || '')
        .replace('{offerDeadline}', offerDeadline || '')
        .replace('{bonusItems}', bonusItems || '')
        .replace('{guarantee}', guarantee || '')
        .replace('{shipping}', shipping || '');
    };

    const basePrompt = replaceVariables(promptTemplate.basePrompt || '');
    const templateContent = replaceVariables(
      adType === 'lead-gen' ? promptTemplate.leadGenTemplate : promptTemplate.conversionTemplate
    );
    const styleGuidelines = styleTemplate ? `\nStyle Guidelines:\n${styleTemplate.guidelines}` : '';

    return `${basePrompt}

${templateContent}
${styleGuidelines}

${templateExamples}

Format your response exactly like this:
1. Primary Text (2000 chars max):
[Write compelling ad copy here]

2. Headline (255 chars max):
[Write attention-grabbing headline here]

3. Description (150 chars max):
[Write concise description here]`;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw new Error('Failed to generate prompt template');
  }
}; 