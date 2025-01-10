'use client';

import DashboardLayout from '@/app/components/DashboardLayout';
import { useState } from 'react';
import { Product } from '@/lib/types/product';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog for content generation</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Create A Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-[#1F2023] rounded-xl p-8 text-center">
          <div className="mb-4 text-4xl">📦</div>
          <h3 className="text-xl font-semibold mb-2">No products yet</h3>
          <p className="text-gray-400 mb-6">
            Add your first product to start generating content
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-700 inline-flex items-center"
          >
            <span className="text-xl mr-2">+</span>
            Create A Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-[#1F2023] rounded-xl p-6 hover:bg-[#1F2023]/80 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📦</span>
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                </div>
                <button className="text-gray-400 hover:text-white">⋮</button>
              </div>
              <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Updated {new Date(product.updatedAt).toLocaleDateString()}
                </div>
                <Link
                  href={`/facebook-ads?productId=${product.id}`}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Create Ad →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && <CreateProductModal onClose={() => setIsCreateModalOpen(false)} />}
    </DashboardLayout>
  );
}

function CreateProductModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAudience: '',
    primaryBenefit: '',
    features: ['']
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1F2023] rounded-xl p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product"
              rows={4}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Target Audience
            </label>
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              placeholder="Who is this product for?"
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Primary Benefit
            </label>
            <input
              type="text"
              name="primaryBenefit"
              value={formData.primaryBenefit}
              onChange={handleInputChange}
              placeholder="Main benefit for your customers"
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Key Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Enter a feature"
                  className="flex-1 bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                {formData.features.length > 1 && (
                  <button
                    onClick={() => removeFeature(index)}
                    className="text-gray-400 hover:text-white px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addFeature}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Feature
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700">
            Create Product
          </button>
        </div>
      </div>
    </div>
  );
} 