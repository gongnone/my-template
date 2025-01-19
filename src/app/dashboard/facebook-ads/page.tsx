'use client';

import { useState } from 'react';
import { useProducts } from '@/lib/contexts/ProductContext';
import FacebookAdGenerator from '@/app/components/FacebookAdGenerator';
import VectorAdGenerator from '@/app/components/VectorAdGenerator';
import { Product } from '@/lib/types/product';
import { customerAvatars } from '@/lib/data/customerAvatars';

export default function FacebookAdsPage() {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatorType, setGeneratorType] = useState<'standard' | 'vector'>('standard');

  if (!selectedProduct) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Facebook Ads</h1>
          <p className="text-gray-400">Select a product to start generating ads</p>
        </div>

        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setGeneratorType('standard')}
              className={`px-4 py-2 rounded-lg ${
                generatorType === 'standard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Standard Generator
            </button>
            <button
              onClick={() => setGeneratorType('vector')}
              className={`px-4 py-2 rounded-lg ${
                generatorType === 'vector'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Vector-Enhanced Generator
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-[#1F2023] rounded-xl p-6 hover:bg-[#1F2023]/80 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">📦</span>
                <h3 className="text-xl font-semibold">{product.name}</h3>
              </div>
              <p className="text-gray-400">{product.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {generatorType === 'standard' ? (
        <FacebookAdGenerator 
          product={selectedProduct} 
          products={products} 
          onBack={() => setSelectedProduct(null)} 
        />
      ) : (
        <VectorAdGenerator
          product={selectedProduct}
          products={products}
          customerAvatars={customerAvatars}
          onBack={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
} 