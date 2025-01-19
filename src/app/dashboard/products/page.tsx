'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types/product';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useProducts } from '@/lib/contexts/ProductContext';
import { getRandomSampleProduct } from '@/lib/utils/sampleProducts';

interface FormData extends Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

export default function ProductsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { user } = useAuth();
  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    setShowDeleteConfirm(null);
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      // TODO: Add error toast notification
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteConfirm && !(event.target as Element).closest('.product-menu')) {
        setShowDeleteConfirm(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDeleteConfirm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-100/10 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <>
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
                <div className="relative product-menu">
                  <button 
                    onClick={() => setShowDeleteConfirm(showDeleteConfirm === product.id ? null : product.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    ⋮
                  </button>
                  {showDeleteConfirm === product.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2A2B2F] rounded-lg shadow-lg py-1 z-10">
                      <button
                        onClick={() => handleEdit(product)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#1F2023] hover:text-white"
                      >
                        Edit Product
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1F2023] hover:text-red-300"
                      >
                        Delete Product
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Updated {product.updatedAt.toLocaleDateString()}
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

      {isCreateModalOpen && (
        <CreateProductModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreate={async (data) => {
            if (!user) return;
            try {
              await addProduct({
                ...data,
                userId: user.uid
              });
              setIsCreateModalOpen(false);
            } catch (err) {
              console.error('Failed to create product:', err);
              // TODO: Add error toast notification
            }
          }}
        />
      )}

      {isEditModalOpen && selectedProduct && (
        <CreateProductModal 
          initialData={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }} 
          onCreate={async (data) => {
            if (!user || !selectedProduct) return;
            try {
              await updateProduct(selectedProduct.id, data);
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            } catch (err) {
              console.error('Failed to update product:', err);
              // TODO: Add error toast notification
            }
          }}
        />
      )}
    </>
  );
}

function CreateProductModal({ 
  onClose, 
  onCreate, 
  initialData 
}: { 
  onClose: () => void;
  onCreate: (data: FormData) => Promise<void>;
  initialData?: Product;
}) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    targetMarket: initialData?.targetMarket || '',
    painPoints: initialData?.painPoints || '',
    uniqueSellingPoints: initialData?.uniqueSellingPoints || '',
    productFeatures: initialData?.productFeatures || [''],
    methodology: initialData?.methodology || '',
    scientificStudies: initialData?.scientificStudies || '',
    featuredInPress: initialData?.featuredInPress || '',
    credibilityMarkers: initialData?.credibilityMarkers || [''],
    uniqueMechanism: initialData?.uniqueMechanism || '',
    answers: initialData?.answers || [{ question: '', answer: '' }],
    statistics: {
      reviews: initialData?.statistics?.reviews || 0,
      rating: initialData?.statistics?.rating || 0,
      totalCustomers: initialData?.statistics?.totalCustomers || 0
    },
    testimonials: initialData?.testimonials || ['']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: keyof Pick<FormData, 'productFeatures' | 'credibilityMarkers' | 'testimonials'>, index: number, value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'productFeatures' | 'credibilityMarkers' | 'testimonials') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'productFeatures' | 'credibilityMarkers' | 'testimonials', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAnswerChange = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [...prev.answers, { question: '', answer: '' }]
    }));
  };

  const handleAutoFill = () => {
    const sampleProduct = getRandomSampleProduct();
    setFormData(sampleProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-[#1F2023] rounded-xl p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{initialData ? 'Edit Product' : 'Create New Product'}</h2>
            <p className="text-gray-400 text-sm">
              {initialData ? 'Update your product details below.' : 'Tell us a little bit about your product here.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {!initialData && (
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-purple-400 hover:text-purple-300 flex items-center space-x-2"
              >
                <span>✨</span>
                <span>Auto-fill Example</span>
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Name/Title/Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Name/Title/Type
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="The name of the product/service/HVCO you are selling"
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Product/Service Category */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product/Service Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g. Diet, Health, Coaching, Digital Marketing"
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Product/Service Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product/Service Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the product/service you are offering. How do people typically use it?"
              rows={4}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Target Market */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Target Market
            </label>
            <textarea
              name="targetMarket"
              value={formData.targetMarket}
              onChange={handleInputChange}
              placeholder="Who is this for? Be specific."
              rows={3}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Pain Points */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Pain Points
            </label>
            <textarea
              name="painPoints"
              value={formData.painPoints}
              onChange={handleInputChange}
              placeholder="What problems does your product solve?"
              rows={3}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Product Features */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Features
            </label>
            {formData.productFeatures.map((feature, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayChange('productFeatures', index, e.target.value)}
                  placeholder="Enter a feature"
                  className="flex-1 bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                {formData.productFeatures.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('productFeatures', index)}
                    className="text-gray-400 hover:text-white px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('productFeatures')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Feature
            </button>
          </div>

          {/* Methodology/Process/Technology */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Specific Methodology/Process/Technology
            </label>
            <textarea
              name="methodology"
              value={formData.methodology}
              onChange={handleInputChange}
              placeholder="e.g. 3-Step Weight Loss Process, 7-Day Marketing Framework, Unique Patented Technology, etc."
              rows={3}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Scientific Studies/Research/Data */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Scientific Studies/Research/Data
            </label>
            <textarea
              name="scientificStudies"
              value={formData.scientificStudies}
              onChange={handleInputChange}
              placeholder="Any relevant research?"
              rows={3}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Featured in Press */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Featured in Press/Media
            </label>
            <textarea
              name="featuredInPress"
              value={formData.featuredInPress}
              onChange={handleInputChange}
              placeholder="e.g. WSJ, BBC, Forbes"
              rows={2}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Unique Mechanism */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Unique Mechanism
            </label>
            <textarea
              name="uniqueMechanism"
              value={formData.uniqueMechanism}
              onChange={handleInputChange}
              placeholder="What makes this unique? What is your special process?"
              rows={3}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Unique Selling Points */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Unique Selling Points
            </label>
            <textarea
              name="uniqueSellingPoints"
              value={formData.uniqueSellingPoints}
              onChange={handleInputChange}
              placeholder="What makes your product stand out from competitors?"
              rows={3}
              className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          {/* Credibility Markers */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Credibility Authority Figure
            </label>
            {formData.credibilityMarkers.map((marker, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={marker}
                  onChange={(e) => handleArrayChange('credibilityMarkers', index, e.target.value)}
                  placeholder="Add credibility marker"
                  className="flex-1 bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('credibilityMarkers', index)}
                  className="text-gray-400 hover:text-white px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('credibilityMarkers')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Credibility Marker
            </button>
          </div>

          {/* Q&A Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Unique Mechanism/FAQ
            </label>
            {formData.answers.map((answer, index) => (
              <div key={index} className="space-y-2 mb-4">
                <input
                  type="text"
                  value={answer.question}
                  onChange={(e) => handleAnswerChange(index, 'question', e.target.value)}
                  placeholder="Question"
                  className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <textarea
                  value={answer.answer}
                  onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                  placeholder="Answer"
                  rows={2}
                  className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      answers: prev.answers.filter((_, i) => i !== index)
                    }));
                  }}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Remove Question
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAnswer}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Question
            </button>
          </div>

          {/* Statistics Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Statistics
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Reviews</label>
                <input
                  type="number"
                  value={formData.statistics.reviews}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    statistics: { ...prev.statistics, reviews: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.statistics.rating}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    statistics: { ...prev.statistics, rating: parseFloat(e.target.value) || 0 }
                  }))}
                  className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Total Customers</label>
                <input
                  type="number"
                  value={formData.statistics.totalCustomers}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    statistics: { ...prev.statistics, totalCustomers: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full bg-[#2A2B2F] text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>
    </form>
  );
} 