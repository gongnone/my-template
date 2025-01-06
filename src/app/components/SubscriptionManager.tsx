'use client';

import { useSubscription } from '@/lib/hooks/useSubscription';
import Link from 'next/link';

export default function SubscriptionManager() {
  const { status, planType, loading } = useSubscription();

  if (loading) {
    return <div>Loading subscription status...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Current Plan:</span>
          <span className="font-medium">
            {planType || 'Free Plan'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`
            font-medium
            ${status === 'active' ? 'text-green-600' : 'text-yellow-600'}
          `}>
            {status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>

        {(!planType || status !== 'active') && (
          <Link
            href="/pricing"
            className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors mt-4"
          >
            Upgrade Plan
          </Link>
        )}
      </div>
    </div>
  );
} 