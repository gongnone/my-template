'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface AdCreative {
  headline: string;
  primaryText: string;
  description: string;
  type: string;
  style: string;
  industry: string;
}

export default function AdDatabaseSeeder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [adData, setAdData] = useState<AdCreative>({
    headline: '',
    primaryText: '',
    description: '',
    type: 'lead-gen',
    style: 'professional',
    industry: 'technology'
  });

  const handleInputChange = (field: keyof AdCreative, value: string) => {
    setAdData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!adData.headline || !adData.primaryText || !adData.description) {
        throw new Error('Please fill in all required fields');
      }

      console.log('Getting embeddings for:', {
        headline: adData.headline,
        primaryText: adData.primaryText,
        description: adData.description
      });

      // Get embeddings for the ad content
      const embeddingResponse = await fetch('/api/openai/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${adData.headline}\n${adData.primaryText}\n${adData.description}`
        })
      });
      
      if (!embeddingResponse.ok) {
        const errorData = await embeddingResponse.json();
        console.error('Embeddings API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate embeddings');
      }
      
      const embedData = await embeddingResponse.json();
      console.log('Embeddings response:', embedData);
      
      if (!embedData.embeddings || !Array.isArray(embedData.embeddings)) {
        console.error('Invalid embeddings response:', embedData);
        throw new Error('Invalid embeddings data received');
      }
      
      // Store in Pinecone
      console.log('Storing in Pinecone...');
      const vector = {
        id: `ad_${Date.now()}`,
        values: embedData.embeddings,
        metadata: {
          headline: adData.headline,
          primaryText: adData.primaryText,
          description: adData.description,
          type: adData.type,
          style: adData.style,
          industry: adData.industry,
          timestamp: new Date().toISOString()
        }
      };

      console.log('Prepared vector:', vector);

      const storeResponse = await fetch('/api/pinecone/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: [vector],
          namespace: 'ads'
        })
      });
      
      if (!storeResponse.ok) {
        let errorMessage;
        try {
          const errorData = await storeResponse.json();
          errorMessage = errorData.error;
        } catch {
          // If response is not JSON, get it as text
          errorMessage = await storeResponse.text();
        }
        console.error('Pinecone API error:', errorMessage);
        throw new Error(errorMessage || 'Failed to store in database');
      }

      let storeData;
      try {
        storeData = await storeResponse.json();
        console.log('Pinecone store response:', storeData);
      } catch (err) {
        console.error('Error parsing Pinecone response:', err);
        // Continue if we can't parse the response but the status was ok
      }

      setSuccess(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setAdData({
          headline: '',
          primaryText: '',
          description: '',
          type: 'lead-gen',
          style: 'professional',
          industry: 'technology'
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error saving ad:', err);
      setError(err instanceof Error ? err.message : 'Failed to save ad to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input
          value={adData.headline}
          onChange={(e) => handleInputChange('headline', e.target.value)}
          placeholder="Enter ad headline"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Primary Text</Label>
        <Textarea
          value={adData.primaryText}
          onChange={(e) => handleInputChange('primaryText', e.target.value)}
          placeholder="Enter primary ad text"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={adData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter ad description"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select 
            value={adData.type}
            onValueChange={(value) => handleInputChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead-gen">Lead Generation</SelectItem>
              <SelectItem value="conversion">Conversion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select
            value={adData.style}
            onValueChange={(value) => handleInputChange('style', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="humorous">Humorous</SelectItem>
              <SelectItem value="dramatic">Dramatic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <Select
            value={adData.industry}
            onValueChange={(value) => handleInputChange('industry', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Ad successfully added to database!</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" /> : 'Submit Ad'}
      </Button>
    </form>
  );
} 