'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface AdCreative {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  canvaDesignId?: string;
  category: 'image' | 'carousel' | 'video';
  dimensions: {
    width: number;
    height: number;
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
  const [filter, setFilter] = useState<'all' | 'image' | 'carousel' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
    // TODO: Open creative in Canva SDK editor
    console.log('Edit creative:', creativeId);
  };

  const handleDelete = (creativeId: string) => {
    const newLibrary = { ...library };
    delete newLibrary.creatives[creativeId];
    setLibrary(newLibrary);
    if (selectedCreative === creativeId) {
      setSelectedCreative(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
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
          onChange={(e) => setFilter(e.target.value as 'all' | 'image' | 'carousel' | 'video')}
          className="bg-[#2A2B2F] rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="carousel">Carousels</option>
          <option value="video">Videos</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCreatives.map(([id, creative]) => (
          <div
            key={id}
            className="bg-[#2A2B2F] rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-600 transition-all cursor-pointer"
            onClick={() => setSelectedCreative(id)}
          >
            <div className="aspect-video relative">
              {creative.imageUrl ? (
                <img
                  src={creative.imageUrl}
                  alt={creative.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">No Preview</span>
                </div>
              )}
              <div className="absolute top-2 right-2 space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(id);
                  }}
                  className="p-2 bg-gray-800/80 rounded-lg hover:bg-gray-700 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(id);
                  }}
                  className="p-2 bg-red-600/80 rounded-lg hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-white">{creative.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{creative.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {creative.dimensions.width} x {creative.dimensions.height}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  creative.category === 'image' 
                    ? 'bg-blue-900/50 text-blue-400'
                    : creative.category === 'carousel'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {creative.category.charAt(0).toUpperCase() + creative.category.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCreative && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-[#2A2B2F] rounded-lg p-6 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Creative Details</h2>
              <button
                onClick={() => setSelectedCreative(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="aspect-video">
              {library.creatives[selectedCreative].imageUrl ? (
                <img
                  src={library.creatives[selectedCreative].imageUrl}
                  alt={library.creatives[selectedCreative].name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Preview</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white">Name</h3>
                <p className="text-gray-400">{library.creatives[selectedCreative].name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Description</h3>
                <p className="text-gray-400">{library.creatives[selectedCreative].description}</p>
              </div>
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
              <div className="pt-4 flex justify-end space-x-4">
                <button
                  onClick={() => handleEdit(selectedCreative)}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 text-white transition-colors"
                >
                  Edit in Canva
                </button>
                <button
                  onClick={() => handleDelete(selectedCreative)}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white transition-colors"
                >
                  Delete Creative
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 