'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import VoiceNotes from '@/app/components/VoiceNotes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VoiceNotesPage() {
  const { user } = useAuth();
  const { status: subscriptionStatus, planType } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Voice Notes</h1>
            <div className="flex items-center gap-4">
              {subscriptionStatus === 'active' ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {planType} Plan
                </span>
              ) : (
                <Link
                  href="/pricing"
                  className="px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700
                    rounded-lg transition-colors"
                >
                  Upgrade Account
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800
                  border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VoiceNotes />
      </main>
    </div>
  );
} 