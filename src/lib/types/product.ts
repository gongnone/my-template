export interface Product {
  id: string;
  userId: string;
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
  answers: {
    question: string;
    answer: string;
  }[];
  statistics: {
    reviews: number;
    rating: number;
    totalCustomers: number;
  };
  testimonials: string[];
  createdAt: Date;
  updatedAt: Date;
} 