'use client';

import Pricing from '@/app/components/Pricing';
import SignInWithGoogle from '@/components/SignInWithGoogle';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function HomeContent() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-900">
      {!user ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold text-white mb-8">
            Write High-Converting Copy In Seconds
          </h1>
          <SignInWithGoogle />
        </div>
      ) : (
        <Pricing />
      )}
    </main>
  );
} 