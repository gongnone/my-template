'use client';

import { useState } from 'react';
import SignInWithGoogle from '@/components/SignInWithGoogle';
import FacebookAdGenerator from '@/app/components/FacebookAdGenerator';
import { Product } from '@/lib/types/product';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [products] = useState<Product[]>([]);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleBack = () => {
    setCurrentProduct(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          Write High-Converting Copy In Seconds
        </h1>
        <SignInWithGoogle />
      </div>
    </div>
  );
}
