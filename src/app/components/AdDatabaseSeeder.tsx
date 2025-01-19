'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download } from 'lucide-react';

interface AdCreative {
  headline: string;
  primaryText: string;
  description: string;
  type: string;
  style: string;
  industry: string;
}

interface ApifyAdSnapshot {
  body?: {
    text?: string;
  };
  title?: string;
  link_description?: string;
  link_url?: string;
  page_categories?: string[];
  images?: Array<{
    original_image_url?: string;
    resized_image_url?: string;
  }>;
  cta_text?: string;
  cta_type?: string;
  display_format?: string;
  page_name?: string;
  page_profile_picture_url?: string;
  page_profile_uri?: string;
  page_like_count?: number;
  caption?: string;
  page_entity_type?: string;
}

interface ApifyAd {
  snapshot?: ApifyAdSnapshot;
  page_name?: string;
  currency?: string;
  start_date?: number;
  end_date?: number;
  publisher_platform?: string[];
  ad_archive_id?: string;
  collation_count?: number;
  collation_id?: string;
  contains_digital_created_media?: boolean;
  contains_sensitive_content?: boolean;
  entity_type?: string;
  advertiser?: {
    page?: {
      about?: {
        text?: string;
      };
    };
    ad_library_page_info?: {
      page_info?: {
        ig_followers?: number;
        ig_username?: string;
        page_category?: string;
        page_cover_photo?: string;
        profile_photo?: string;
      };
    };
  };
  aaa_info?: {
    targets_eu?: boolean;
    location_audience?: Array<{
      name: string;
      type: string;
      excluded: boolean;
    }>;
    gender_audience?: string;
    age_audience?: {
      min: number;
      max: number;
    };
  };
}

export default function AdDatabaseSeeder() {
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [importUrl, setImportUrl] = useState('https://api.apify.com/v2/datasets/yOwqhUE2fT5L4ZPz6/items?clean=true&format=json');
  
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

  const importAdsFromApify = async () => {
    try {
      if (!importUrl.trim()) {
        setError('Please enter a valid import URL');
        return;
      }

      setImportLoading(true);
      setError(null);
      setImportStatus('Fetching ads from API...');

      const response = await fetch(importUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch ads from API');
      }

      const ads: ApifyAd[] = await response.json();
      setImportStatus(`Processing ${ads.length} ads...`);

      let successCount = 0;
      let errorCount = 0;

      for (const ad of ads) {
        try {
          // Debug: Log the entire ad object to see its structure
          console.log('Full ad object:', JSON.stringify(ad, null, 2));

          // Debug: Log snapshot structure
          console.log('Snapshot structure:', {
            hasSnapshot: !!ad.snapshot,
            snapshotKeys: ad.snapshot ? Object.keys(ad.snapshot) : [],
            imagesArray: ad.snapshot?.images,
          });

          // Extract content from snapshot
          const headline = ad.snapshot?.title || '';
          const primaryText = ad.snapshot?.body?.text || '';
          const description = ad.snapshot?.link_description || '';
          const industry = ad.snapshot?.page_categories?.[0] || 'unknown';
          
          // Debug: Log raw images array
          console.log('Raw images array:', ad.snapshot?.images);

          // Process images and ensure URLs are valid
          const images = ad.snapshot?.images || [];
          const originalUrls = images
            .map(img => img.original_image_url)
            .filter(url => typeof url === 'string' && url.length > 0);

          const resizedUrls = images
            .map(img => img.resized_image_url)
            .filter(url => typeof url === 'string' && url.length > 0);

          console.log('Processed URLs:', {
            originalUrls,
            resizedUrls
          });
          
          // Skip if we don't have enough content
          if (!headline.trim() && !primaryText.trim() && !description.trim()) {
            console.log('Skipping ad due to missing content:', { headline, primaryText, description });
            errorCount++;
            continue;
          }

          // Ensure we have at least some content to work with
          const finalHeadline = headline.trim() || 'Untitled Ad';
          const finalPrimaryText = primaryText.trim() || description.trim() || headline.trim();
          const finalDescription = description.trim() || primaryText.trim() || headline.trim();

          // Get embeddings
          const embeddingResponse = await fetch('/api/openai/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `${finalHeadline}\n${finalPrimaryText}\n${finalDescription}`
            })
          });

          if (!embeddingResponse.ok) {
            const errorData = await embeddingResponse.json();
            console.error('Embedding error:', errorData);
            errorCount++;
            continue;
          }

          const embedData = await embeddingResponse.json();

          if (!embedData.embeddings || !Array.isArray(embedData.embeddings)) {
            console.error('Invalid embedding data:', embedData);
            errorCount++;
            continue;
          }

          // Store in Pinecone with flattened metadata
          const vector = {
            id: `ad_${Date.now()}_${successCount}`,
            values: embedData.embeddings,
            metadata: {
              // Core content
              headline: finalHeadline,
              primaryText: finalPrimaryText,
              description: finalDescription,
              type: 'social-ad',
              style: 'professional',
              industry: industry,
              
              // Ad details
              ctaText: ad.snapshot?.cta_text || '',
              ctaType: ad.snapshot?.cta_type || '',
              displayFormat: ad.snapshot?.display_format || '',
              landingPage: ad.snapshot?.link_url || '',
              caption: ad.snapshot?.caption || '',
              
              // Images
              imageUrls: originalUrls.join(','),
              imageUrlsResized: resizedUrls.join(','),
              primaryImageUrl: originalUrls[0] || '',
              primaryImageUrlResized: resizedUrls[0] || '',
              
              // Page info
              pageName: ad.snapshot?.page_name || ad.page_name || '',
              pageProfilePicture: ad.snapshot?.page_profile_picture_url || '',
              pageProfileUrl: ad.snapshot?.page_profile_uri || '',
              pageLikeCount: ad.snapshot?.page_like_count?.toString() || '0',
              pageCategories: JSON.stringify(ad.snapshot?.page_categories || []),
              pageEntityType: ad.snapshot?.page_entity_type || '',
              
              // Campaign details
              campaignStartDate: ad.start_date ? new Date(ad.start_date * 1000).toISOString() : '',
              campaignEndDate: ad.end_date ? new Date(ad.end_date * 1000).toISOString() : '',
              publisherPlatforms: ad.publisher_platform?.join(',') || '',
              currency: ad.currency || '',
              
              // Targeting
              targetsEU: ad.aaa_info?.targets_eu?.toString() || 'false',
              targetLocations: JSON.stringify(ad.aaa_info?.location_audience?.map(loc => ({
                name: loc.name,
                type: loc.type,
                excluded: loc.excluded
              })) || []),
              targetGender: ad.aaa_info?.gender_audience || 'all',
              targetAgeMin: ad.aaa_info?.age_audience?.min?.toString() || '',
              targetAgeMax: ad.aaa_info?.age_audience?.max?.toString() || '',
              
              // Additional ad details
              adArchiveId: ad.ad_archive_id || '',
              collationCount: ad.collation_count?.toString() || '',
              collationId: ad.collation_id || '',
              containsDigitalCreatedMedia: ad.contains_digital_created_media?.toString() || 'false',
              containsSensitiveContent: ad.contains_sensitive_content?.toString() || 'false',
              entityType: ad.entity_type || '',
              
              // Additional page info from advertiser
              advertiserAbout: ad.advertiser?.page?.about?.text || '',
              advertiserIgFollowers: ad.advertiser?.ad_library_page_info?.page_info?.ig_followers?.toString() || '',
              advertiserIgUsername: ad.advertiser?.ad_library_page_info?.page_info?.ig_username || '',
              advertiserPageCategory: ad.advertiser?.ad_library_page_info?.page_info?.page_category || '',
              advertiserPageCoverPhoto: ad.advertiser?.ad_library_page_info?.page_info?.page_cover_photo || '',
              advertiserProfilePhoto: ad.advertiser?.ad_library_page_info?.page_info?.profile_photo || '',
              
              // System fields
              timestamp: new Date().toISOString(),
              source: 'apify'
            }
          };

          console.log('Image URLs being stored:', {
            imageUrls: vector.metadata.imageUrls,
            imageUrlsResized: vector.metadata.imageUrlsResized,
            primaryImageUrl: vector.metadata.primaryImageUrl,
            primaryImageUrlResized: vector.metadata.primaryImageUrlResized
          });

          const storeResponse = await fetch('/api/pinecone/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vectors: [vector],
              namespace: 'ads'
            })
          });

          if (storeResponse.ok) {
            successCount++;
            setImportStatus(`Imported ${successCount} ads...`);
          } else {
            const errorData = await storeResponse.json();
            console.error('Pinecone error:', errorData);
            errorCount++;
          }
        } catch (err) {
          console.error('Error processing ad:', err);
          console.error('Error details:', {
            message: err.message,
            stack: err.stack
          });
          errorCount++;
        }
      }

      setImportStatus(`Import complete! Successfully imported ${successCount} ads. Failed to import ${errorCount} ads.`);
    } catch (err) {
      console.error('Error importing ads:', err);
      setError(err instanceof Error ? err.message : 'Failed to import ads');
    } finally {
      setImportLoading(false);
    }
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
      {/* Manual Ad Creation Form */}
      <div className="space-y-6 border-b border-gray-200 pb-6">
        <h2 className="text-xl font-semibold">Manual Ad Creation</h2>
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" /> : 'Submit Ad'}
        </Button>
      </div>

      {/* Bulk Import Section */}
      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-semibold">Bulk Import</h2>
        
        <div className="space-y-2">
          <Label>Import URL</Label>
          <div className="flex gap-2">
            <Input
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="Enter Apify dataset URL"
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              disabled={importLoading} 
              onClick={importAdsFromApify}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {importLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Import Ads
            </Button>
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

        {importStatus && (
          <Alert>
            <AlertDescription>{importStatus}</AlertDescription>
          </Alert>
        )}
      </div>
    </form>
  );
} 