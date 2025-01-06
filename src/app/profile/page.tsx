'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logoutUser } = useAuth();
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
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* User Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-800">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Account Created</label>
                <p className="text-gray-800">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Subscription Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Current Plan</label>
                <p className="text-gray-800">{planType || 'Free Plan'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className={`font-medium ${
                  subscriptionStatus === 'active' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {(!planType || subscriptionStatus !== 'active') ? (
              <Link
                href="/pricing"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Upgrade Plan
              </Link>
            ) : (
              <button
                className="text-gray-600 hover:text-gray-800 underline"
                onClick={() => {
                  // TODO: Implement subscription management portal
                  alert('Subscription management coming soon!');
                }}
              >
                Manage Subscription
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <button
              onClick={logoutUser}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 