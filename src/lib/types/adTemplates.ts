export interface AdTemplate {
  id: string;
  style: string;
  type: 'lead-gen' | 'conversion';
  primaryText: string;
  headline: string;
  description: string;
  industry?: string;
  tags?: string[];
}

export interface AdExampleContext {
  style: string;
  type: 'lead-gen' | 'conversion';
  examples: {
    primaryText: string;
    headline: string;
    description: string;
  }[];
} 