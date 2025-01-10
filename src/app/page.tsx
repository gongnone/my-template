'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SignInWithGoogle from '@/components/SignInWithGoogle';
import FacebookAdGenerator from '@/app/components/FacebookAdGenerator';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Voice Notes App
        </h1>
        <SignInWithGoogle />
        <FacebookAdGenerator 
          product={initialProduct} 
          products={products}
          onBack={handleBack} 
        />
      </div>
    </div>
  );
}
