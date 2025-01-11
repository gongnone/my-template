'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface AdCreative {
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
  adContent?: {
    style: string;
    type: 'lead-gen' | 'conversion';
    primaryText: string;
    headline: string;
    description: string;
    industry?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdCreativesLibrary {
  creatives: {
    [key: string]: AdCreative;
  };
}

const defaultLibrary: AdCreativesLibrary = {
  creatives: {}
};

export default function AdCreativesLibrary() {
  const [library, setLibrary] = useLocalStorage<AdCreativesLibrary>(
    'ad-creatives-library',
    defaultLibrary
  );
  const [selectedCreative, setSelectedCreative] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'carousel' | 'video' | 'text'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<AdCreative | null>(null);

  const filteredCreatives = Object.entries(library.creatives)
    .filter(([_, creative]) => {
      if (filter === 'all') return true;
      return creative.category === filter;
    })
    .filter(([_, creative]) => {
      if (!searchTerm) return true;
      return (
        creative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creative.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const handleCreateNew = () => {
    // TODO: Integrate with Canva SDK for new design
    console.log('Create new creative');
  };

  const handleEdit = (creativeId: string) => {
    setIsEditing(true);
    setEditFormData(library.creatives[creativeId]);
    setSelectedCreative(creativeId);
  };

  const handleSaveEdit = () => {
    if (!selectedCreative || !editFormData) return;
    
    const newLibrary = { ...library };
    newLibrary.creatives[selectedCreative] = {
      ...editFormData,
      updatedAt: new Date().toISOString()
    };
    
    setLibrary(newLibrary);
    setIsEditing(false);
    setEditFormData(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(null);
  };

  const handleEditInputChange = (
    field: keyof AdCreative | 'primaryText' | 'headline' | 'description' | 'style' | 'type',
    value: string
  ) => {
    if (!editFormData) return;

    if (field === 'primaryText' || field === 'headline' || field === 'description' || field === 'style' || field === 'type') {
      setEditFormData({
        ...editFormData,
        adContent: {
          ...editFormData.adContent,
          style: editFormData.adContent?.style || '',
          type: (editFormData.adContent?.type || 'lead-gen') as 'lead-gen' | 'conversion',
          primaryText: editFormData.adContent?.primaryText || '',
          headline: editFormData.adContent?.headline || '',
          description: editFormData.adContent?.description || '',
          [field]: value
        }
      });
    } else {
      setEditFormData({
        ...editFormData,
        [field]: value
      });
    }
  };

  const handleDelete = (creativeId: string) => {
    const newLibrary = { ...library };
    delete newLibrary.creatives[creativeId];
    setLibrary(newLibrary);
    if (selectedCreative === creativeId) {
      setSelectedCreative(null);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Add success toast
    } catch (err) {
      console.error('Failed to copy:', err);
      // TODO: Add error toast
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Ad Creatives Library</h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white transition-colors"
        >
          Create New Creative
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search creatives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2A2B2F] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'image' | 'carousel' | 'video' | 'text')}
          className="bg-[#2A2B2F] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="text">Text Ads</option>
          <option value="image">Images</option>
          <option value="carousel">Carousels</option>
          <option value="video">Videos</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCreatives.map(([id, creative]) => (
          <div
            key={id}
            className="bg-[#2A2B2F] rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-600 transition-all cursor-pointer h-[280px] flex flex-col"
            onClick={() => setSelectedCreative(id)}
          >
            {creative.category === 'text' ? (
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-400">
                    {creative.adContent?.type === 'lead-gen' ? 'Lead Generation' : 'Conversion'}
                  </span>
                  <span className="text-xs text-gray-400">{creative.adContent?.style}</span>
                </div>
                <h3 className="font-medium text-white mb-2 line-clamp-2">{creative.adContent?.headline || creative.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-4 flex-1">{creative.adContent?.primaryText || creative.description}</p>
              </div>
            ) : (
              <div className="p-4 flex-1">
                <h3 className="font-medium text-white line-clamp-1">{creative.name}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{creative.description}</p>
              </div>
            )}
            <div className="border-t border-gray-700 p-4 flex items-center justify-between mt-auto">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(id);
                  }}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(id);
                  }}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCreative && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-start justify-center p-6 overflow-y-auto"
          onClick={() => !isEditing && setSelectedCreative(null)}
        >
          <div 
            className="bg-[#2A2B2F] rounded-lg p-6 max-w-2xl w-full my-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Creative' : 'Creative Details'}
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setSelectedCreative(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </button>
              )}
            </div>

            {library.creatives[selectedCreative].category === 'text' ? (
              <div className="space-y-6">
                {isEditing && editFormData ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Name</h3>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => handleEditInputChange('name', e.target.value)}
                        className="w-full bg-[#1F2023] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Primary Text</h3>
                      <textarea
                        value={editFormData.adContent?.primaryText || ''}
                        onChange={(e) => handleEditInputChange('primaryText', e.target.value)}
                        rows={4}
                        className="w-full bg-[#1F2023] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Headline</h3>
                      <input
                        type="text"
                        value={editFormData.adContent?.headline || ''}
                        onChange={(e) => handleEditInputChange('headline', e.target.value)}
                        className="w-full bg-[#1F2023] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Description</h3>
                      <textarea
                        value={editFormData.adContent?.description || ''}
                        onChange={(e) => handleEditInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full bg-[#1F2023] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white mb-2">Style</h3>
                        <input
                          type="text"
                          value={editFormData.adContent?.style || ''}
                          onChange={(e) => handleEditInputChange('style', e.target.value)}
                          className="w-full bg-[#1F2023] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white mb-2">Type</h3>
                        <select
                          value={editFormData.adContent?.type || 'lead-gen'}
                          onChange={(e) => handleEditInputChange('type', e.target.value)}
                          className="w-full bg-[#1F2023] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        >
                          <option value="lead-gen">Lead Generation</option>
                          <option value="conversion">Conversion</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Primary Text</h3>
                      <div className="relative">
                        <div className="bg-[#1F2023] rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
                          {library.creatives[selectedCreative].adContent?.primaryText}
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(library.creatives[selectedCreative].adContent?.primaryText || '')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Headline</h3>
                      <div className="relative">
                        <div className="bg-[#1F2023] rounded-lg p-4 text-gray-300">
                          {library.creatives[selectedCreative].adContent?.headline}
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(library.creatives[selectedCreative].adContent?.headline || '')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Description</h3>
                      <div className="relative">
                        <div className="bg-[#1F2023] rounded-lg p-4 text-gray-300">
                          {library.creatives[selectedCreative].adContent?.description}
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(library.creatives[selectedCreative].adContent?.description || '')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <div>
                        <span className="font-medium text-white">Style:</span> {library.creatives[selectedCreative].adContent?.style}
                      </div>
                      <div>
                        <span className="font-medium text-white">Type:</span> {library.creatives[selectedCreative].adContent?.type}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-white">Name</h3>
                  <p className="text-gray-400">{library.creatives[selectedCreative].name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Description</h3>
                  <p className="text-gray-400">{library.creatives[selectedCreative].description}</p>
                </div>
                {library.creatives[selectedCreative].dimensions && (
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">Dimensions</h3>
                      <p className="text-gray-400">
                        {library.creatives[selectedCreative].dimensions.width} x{' '}
                        {library.creatives[selectedCreative].dimensions.height}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">Category</h3>
                      <p className="text-gray-400">
                        {library.creatives[selectedCreative].category.charAt(0).toUpperCase() +
                          library.creatives[selectedCreative].category.slice(1)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 text-white transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(selectedCreative)}
                    className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white transition-colors"
                  >
                    Edit Creative
                  </button>
                  <button
                    onClick={() => handleDelete(selectedCreative)}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white transition-colors"
                  >
                    Delete Creative
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 