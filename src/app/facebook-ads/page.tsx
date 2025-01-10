'use client';

import DashboardLayout from '../components/DashboardLayout';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/types/product';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FacebookAdGenerator from '../components/FacebookAdGenerator';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProducts } from '@/lib/contexts/ProductContext';

export default function FacebookAdsPage() {
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const { products, loading, error } = useProducts();

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [searchParams, products]);

  if (!selectedProduct) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-2">Facebook Ad Generator</h1>
        <p className="text-gray-400 mb-8">Generate tailored Facebook ad copy and captivating headlines.</p>

        <div className="bg-[#1F2023] rounded-xl p-6">
          <div className="flex flex-col items-center justify-center py-12">
            {loading ? (
              <div className="text-gray-400">Loading products...</div>
            ) : error ? (
              <div className="text-red-400">Error loading products: {error}</div>
            ) : (
              <>
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">Select a Product</h3>
                <p className="text-gray-400 mb-6 text-center max-w-md">
                  Choose a product from your catalog or create a new one to generate Facebook ads
                </p>
                {products.length === 0 ? (
                  <Link
                    href="/products/new"
                    className="bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Create Your First Product
                  </Link>
                ) : (
                  <div className="w-full max-w-md">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="w-full bg-[#2A2B2F] p-4 rounded-lg mb-2 text-left hover:bg-[#2A2B2F]/80"
                      >
                        <div className="font-semibold mb-1">{product.name}</div>
                        <div className="text-sm text-gray-400 line-clamp-2">
                          {product.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto p-6">
        <FacebookAdGenerator 
          product={selectedProduct} 
          products={products} 
          onBack={() => setSelectedProduct(null)} 
        />
      </div>
    </DashboardLayout>
  );
} 