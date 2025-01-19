import { CustomerAvatar } from '../types/customerAvatars';

export const customerAvatars: CustomerAvatar[] = [
  {
    id: 'fitness-professional',
    name: 'Busy Professional Fitness Enthusiast',
    description: 'Urban professionals aged 28-45 who are health-conscious but time-constrained, seeking efficient fitness solutions.',
    demographics: {
      ageRange: '28-45',
      gender: 'All',
      location: 'Urban Areas',
      income: '$75,000-150,000',
      education: "Bachelor's or higher",
      occupation: 'Professional/Corporate'
    },
    psychographics: {
      interests: ['Fitness', 'Health', 'Time Management', 'Technology', 'Career Growth'],
      values: ['Health', 'Efficiency', 'Professional Success', 'Work-Life Balance'],
      lifestyle: ['Fast-paced', 'Health-conscious', 'Career-focused', 'Tech-savvy'],
      personality: ['Ambitious', 'Disciplined', 'Results-oriented'],
      goals: ['Stay fit despite busy schedule', 'Maintain energy levels', 'Reduce stress']
    },
    painPoints: [
      'Limited time for exercise',
      'Stress from work-life balance',
      'Irregular schedule',
      'Difficulty maintaining fitness routine'
    ],
    motivations: [
      'Look and feel better',
      'Increase productivity',
      'Improve health metrics',
      'Set good example for team/family'
    ],
    buyingBehavior: {
      preferredChannels: ['Mobile Apps', 'Email', 'Social Media', 'Professional Networks'],
      pricePreference: 'Premium',
      decisionFactors: ['Time-saving', 'Convenience', 'Proven results', 'Professional reviews'],
      researchHabits: ['Online reviews', 'Peer recommendations', 'Industry publications']
    },
    mediaConsumption: {
      platforms: ['LinkedIn', 'Instagram', 'YouTube', 'Fitness Apps'],
      contentPreferences: ['Quick video tutorials', 'Data-driven content', 'Success stories'],
      timeSpent: 'Heavy mobile usage, primarily mornings and evenings'
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'wellness-parent',
    name: 'Health-Conscious Parent',
    description: 'Parents aged 30-45 focused on family health and wellness, looking for solutions that benefit the whole family.',
    demographics: {
      ageRange: '30-45',
      gender: 'All',
      location: 'Suburban Areas',
      income: '$85,000-120,000',
      education: "Bachelor's Degree",
      occupation: 'Various Professional Roles'
    },
    psychographics: {
      interests: ['Family Health', 'Nutrition', 'Parenting', 'Natural Products', 'Wellness'],
      values: ['Family', 'Health', 'Quality', 'Safety', 'Education'],
      lifestyle: ['Family-oriented', 'Active', 'Community-involved', 'Health-conscious'],
      personality: ['Nurturing', 'Responsible', 'Research-oriented'],
      goals: ['Improve family health', 'Set good examples', 'Create healthy habits']
    },
    painPoints: [
      'Balancing family and personal health',
      'Finding kid-friendly healthy options',
      'Time management with family schedule',
      'Budget constraints for premium health products'
    ],
    motivations: [
      'Family well-being',
      'Prevention of health issues',
      'Creating lasting healthy habits',
      'Being a role model'
    ],
    buyingBehavior: {
      preferredChannels: ['Online Retail', 'Social Media', 'Parent Forums', 'Local Community Groups'],
      pricePreference: 'Mid to Premium',
      decisionFactors: ['Safety', 'Family-friendly', 'Value for money', 'Convenience'],
      researchHabits: ['Parent forums', 'Social media groups', 'Product reviews']
    },
    mediaConsumption: {
      platforms: ['Facebook', 'Instagram', 'Pinterest', 'Parenting Blogs'],
      contentPreferences: ['How-to guides', 'Family success stories', 'Expert advice'],
      timeSpent: 'Regular social media usage, evening content consumption'
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'mindful-millennial',
    name: 'Mindful Millennial',
    description: 'Young urban professionals aged 25-35 focused on holistic wellness and mental health, seeking balance in modern life.',
    demographics: {
      ageRange: '25-35',
      gender: 'All',
      location: 'Urban Centers',
      income: '$60,000-90,000',
      education: "Bachelor's or Master's",
      occupation: 'Creative/Tech/Professional Services'
    },
    psychographics: {
      interests: ['Mental Health', 'Mindfulness', 'Sustainability', 'Personal Growth', 'Wellness Tech'],
      values: ['Authenticity', 'Work-Life Balance', 'Sustainability', 'Personal Development'],
      lifestyle: ['Mindful', 'Eco-conscious', 'Digital-first', 'Experience-seeking'],
      personality: ['Open-minded', 'Progressive', 'Self-aware'],
      goals: ['Achieve mental wellness', 'Build sustainable habits', 'Find work-life harmony']
    },
    painPoints: [
      'Digital overwhelm',
      'Anxiety and stress',
      'Information overload',
      'Seeking authentic experiences'
    ],
    motivations: [
      'Mental clarity',
      'Emotional well-being',
      'Personal growth',
      'Environmental impact'
    ],
    buyingBehavior: {
      preferredChannels: ['Instagram', 'TikTok', 'Direct to Consumer', 'Wellness Apps'],
      pricePreference: 'Mid-range to Premium',
      decisionFactors: ['Brand values', 'Sustainability', 'User experience', 'Social proof'],
      researchHabits: ['Social media', 'Influencer recommendations', 'Peer reviews']
    },
    mediaConsumption: {
      platforms: ['Instagram', 'TikTok', 'Spotify', 'YouTube'],
      contentPreferences: ['Short-form video', 'Podcasts', 'Interactive content'],
      timeSpent: 'Heavy digital consumption throughout day'
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];