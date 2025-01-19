'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/product';
import { useAuth } from './AuthContext';
import { getUserProducts, createProduct, updateProduct, deleteProduct } from '../firebase/productUtils';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshProducts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userProducts = await getUserProducts(user.uid);
      setProducts(userProducts);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProducts();
    }
  }, [user]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');
    const productId = await createProduct(user.uid, productData);
    await refreshProducts();
    return productId;
  };

  const updateProductItem = async (productId: string, updates: Partial<Product>) => {
    await updateProduct(productId, updates);
    await refreshProducts();
  };

  const deleteProductItem = async (productId: string) => {
    await deleteProduct(productId);
    await refreshProducts();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        addProduct,
        updateProduct: updateProductItem,
        deleteProduct: deleteProductItem,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
} 