export interface CustomerAvatar {
  id: string;
  name: string;
  description: string;
  demographics: {
    ageRange: string;
    gender: string;
    location: string;
    income: string;
    education: string;
    occupation: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    lifestyle: string[];
    personality: string[];
    goals: string[];
  };
  painPoints: string[];
  motivations: string[];
  buyingBehavior: {
    preferredChannels: string[];
    pricePreference: string;
    decisionFactors: string[];
    researchHabits: string[];
  };
  mediaConsumption: {
    platforms: string[];
    contentPreferences: string[];
    timeSpent: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAvatarWithEmbedding extends CustomerAvatar {
  embedding: number[];
} 