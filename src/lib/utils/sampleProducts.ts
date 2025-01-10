interface SampleProduct {
  name: string;
  description: string;
  category: string;
  targetMarket: string;
  painPoints: string;
  uniqueSellingPoints: string;
  productFeatures: string[];
  methodology: string;
  scientificStudies: string;
  featuredInPress: string;
  credibilityMarkers: string[];
  uniqueMechanism: string;
  answers: Array<{ question: string; answer: string }>;
  statistics: {
    reviews: number;
    rating: number;
    totalCustomers: number;
  };
  testimonials: string[];
}

const sampleProducts: SampleProduct[] = [
  {
    name: "MindfulBody Pro Fitness Program",
    description: "A revolutionary 12-week fitness transformation program combining mindfulness, nutrition, and progressive resistance training.",
    category: "Health & Fitness",
    targetMarket: "Busy professionals aged 30-50 who want to get fit but struggle with traditional gym routines and need a more holistic approach to wellness.",
    painPoints: "Lack of time for exercise, confusion about proper nutrition, stress-related weight gain, failed attempts at traditional diets, and difficulty maintaining motivation.",
    uniqueSellingPoints: "Integrates mindfulness with fitness, personalized nutrition plans, mobile app tracking, weekly live coaching calls, and a supportive community.",
    productFeatures: [
      "Personalized workout plans",
      "Mindfulness meditation library",
      "Meal planning app",
      "Progress tracking dashboard",
      "Weekly live coaching sessions"
    ],
    methodology: "The Triple-M Method™ (Mindfulness, Movement, Meals) - A scientifically-backed approach that synchronizes mental wellness with physical training.",
    scientificStudies: "Based on research from Harvard Medical School showing 47% better results when combining mindfulness with exercise. Validated by sports science studies at Stanford University.",
    featuredInPress: "Featured in Men's Health, Women's Fitness, Forbes Health, and The Wall Street Journal's wellness section.",
    credibilityMarkers: [
      "Developed by Dr. Sarah Chen, Sports Medicine PhD",
      "Endorsed by Olympic athletes",
      "Featured on TED Talks",
      "Winner of 2023 Wellness Innovation Award"
    ],
    uniqueMechanism: "The program uses AI-powered adaptive training algorithms that adjust your workout intensity based on stress levels, sleep quality, and recovery metrics.",
    answers: [
      {
        question: "How is this different from other fitness programs?",
        answer: "Unlike traditional programs, MindfulBody Pro integrates mental wellness with physical training, using real-time biometric data to optimize your workout intensity."
      },
      {
        question: "How much time do I need to commit daily?",
        answer: "Just 30 minutes per day, with flexibility to split sessions. Our AI adapts the program to your schedule and energy levels."
      }
    ],
    statistics: {
      reviews: 1547,
      rating: 4.8,
      totalCustomers: 12000
    },
    testimonials: [
      "Lost 30 pounds and gained incredible mental clarity. This program changed my life!",
      "Finally a fitness program that understands busy professionals. Down 25 pounds in 3 months!"
    ]
  }
];

export function getRandomSampleProduct(): SampleProduct {
  return sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
} 