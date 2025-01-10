'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function DashboardPage() {
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
    <DashboardLayout>
      <div className="flex items-center space-x-4 mb-8">
        <button className="bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20">
          View Favourite Headlines
        </button>
        <button className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700">
          Create New Ad
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
      <p className="text-gray-400 mb-8">Select a tool from the sidebar to get started.</p>

      <div className="grid grid-cols-2 gap-6">
        {/* Quick Access Cards */}
        <div className="bg-[#1F2023] rounded-xl p-6 hover:bg-[#1F2023]/80 transition cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">📝</span>
            <h3 className="text-xl font-semibold">Recent Headlines</h3>
          </div>
          <p className="text-gray-400">View and edit your recently generated headlines</p>
        </div>

        <div className="bg-[#1F2023] rounded-xl p-6 hover:bg-[#1F2023]/80 transition cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-semibold">Analytics</h3>
          </div>
          <p className="text-gray-400">Track your content performance</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 