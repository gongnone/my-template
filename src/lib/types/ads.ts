export interface AdContent {
  style: string;
  type: 'lead-gen' | 'conversion';
  primaryText: string;
  headline: string;
  description: string;
  industry?: string;
  tags?: string[];
}

export interface AdCreative {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  canvaDesignId?: string;
  category: 'image' | 'carousel' | 'video' | 'text';
  dimensions?: {
    width: number;
    height: number;
  };
  adContent?: AdContent;
  createdAt: string;
  updatedAt: string;
}

export interface AdMetrics {
  clickThroughRate: number;
  conversionRate: number;
  engagement: number;
  impressions: number;
}

export interface VectorizedAd {
  id: string;
  embedding: number[];
  content: AdCreative;
  metrics: AdMetrics;
  timestamp: string;
} 