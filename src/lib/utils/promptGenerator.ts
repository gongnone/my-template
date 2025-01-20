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

const DEFAULT_TEMPLATES = {
  basePrompt: `You are a professional Facebook ad copywriter. Create a compelling Facebook ad that follows the provided style and guidelines. The ad should be engaging, persuasive, and optimized for the platform.

Product Information:
- Target Market: {targetMarket}
- Product/Service: {specificFeatures}
- Pain Points: {painPoints}
- Benefits: {benefits}
- Product Description: {productDescription}
- Unique Story: {theStory}
- Key Benefits: {listBenefits}
- Technical Details: {specificTerms}
- Research/Studies: {studiesAndResearch}
- Authority/Credibility: {authority}
- Press Features: {pressInfo}
- Reviews: {numberOfReviews} reviews with {averageStarRating} average rating
- Social Proof: {fiveStarText}`,

  leadGenTemplate: `Create a lead generation ad that focuses on capturing user information through a {callToAction}. The ad should build trust, demonstrate value, and compel the target audience to take action.`,

  conversionTemplate: `Create a conversion-focused ad that drives sales. Include these offer details:
- Regular Price: {regularPrice}
- Sale Price: {salePrice}
- Discount: {discountPercentage}% off
- Deadline: {offerDeadline}
- Bonuses: {bonusItems}
- Guarantee: {guarantee}
- Shipping: {shipping}

The ad should create urgency, highlight value, and drive immediate purchases.`,

  styleTemplates: {
    professional: {
      guidelines: "Use formal language, focus on credibility and expertise. Avoid slang or casual expressions."
    },
    casual: {
      guidelines: "Use conversational tone, be friendly and relatable. Include emojis where appropriate."
    },
    dramatic: {
      guidelines: "Create emotional impact, use powerful language and storytelling. Focus on transformation."
    },
    minimal: {
      guidelines: "Be concise and direct. Focus on key benefits and clear value proposition."
    },
    humorous: {
      guidelines: "Use appropriate humor and wit. Keep it light while maintaining professionalism."
    },
    educational: {
      guidelines: "Focus on teaching and insights. Share valuable information while building credibility."
    },
    social_proof: {
      guidelines: "Emphasize testimonials, reviews, and real results. Build trust through others' experiences."
    },
    pas: {
      guidelines: "Follow Problem-Agitation-Solution format. Identify pain point, amplify it, then present solution."
    },
    aida: {
      guidelines: "Follow Attention-Interest-Desire-Action format. Hook attention, build interest, create desire, prompt action."
    },
    fomo: {
      guidelines: "Create fear of missing out. Emphasize scarcity, urgency, and exclusive benefits."
    }
  }
};

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
    // Get templates from localStorage or use defaults
    const storedTemplates = localStorage.getItem('ad-prompt-template');
    const promptTemplate = storedTemplates ? JSON.parse(storedTemplates) : DEFAULT_TEMPLATES;
    
    // Merge with default templates to ensure all required templates exist
    const templates = {
      ...DEFAULT_TEMPLATES,
      ...promptTemplate,
      styleTemplates: {
        ...DEFAULT_TEMPLATES.styleTemplates,
        ...(promptTemplate.styleTemplates || {})
      }
    };

    const styleTemplate = templates.styleTemplates[adStyle];

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

    const basePrompt = replaceVariables(templates.basePrompt);
    const templateContent = replaceVariables(
      adType === 'lead-gen' ? templates.leadGenTemplate : templates.conversionTemplate
    );
    const styleGuidelines = styleTemplate ? `\nStyle Guidelines:\n${styleTemplate.guidelines}` : '';

    return `You are a professional Facebook ad copywriter. Generate a Facebook ${adType} ad using the following information and style guidelines.

Product Information:
${basePrompt}

Ad Type Requirements:
${templateContent}

${styleGuidelines}

${templateExamples}

IMPORTANT: Generate only the ad content in exactly this format, without any additional text:

1. Primary Text:
[Your primary text here]

2. Headline:
[Your headline here]

3. Description:
[Your description here]`;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw new Error('Failed to generate prompt template');
  }
}; 