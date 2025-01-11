'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logoutUser } from '@/lib/firebase/firebaseUtils';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user } = useAuth();
  const { status, planType, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (user) {
      try {
        await updateProfile(user, { 
          displayName: displayName 
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Profile update failed', error);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1F2023] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="bg-[#2A2B2F] rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-6 mb-6">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl">
                {user.displayName ? user.displayName[0].toUpperCase() : '👤'}
              </div>
            )}
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full bg-[#1F2023] text-white rounded-lg px-4 py-2"
                  />
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleUpdateProfile}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setDisplayName(user.displayName || '');
                        setIsEditing(false);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold">
                    {user.displayName || 'User'}
                  </h2>
                  <p className="text-gray-400">{user.email}</p>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-purple-400 hover:text-purple-300 mt-2"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-[#2A2B2F] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Subscription Details</h3>
          {subscriptionLoading ? (
            <div className="text-gray-400">Loading subscription...</div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span>Current Plan:</span>
                <span className="font-bold">
                  {planType ? `${planType} Plan` : 'No Active Plan'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span 
                  className={`font-bold ${
                    status === 'active' 
                      ? 'text-green-500' 
                      : status === 'past_due' 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                  }`}
                >
                  {status === 'active' 
                    ? 'Active' 
                    : status === 'past_due' 
                    ? 'Past Due' 
                    : 'Inactive'}
                </span>
              </div>
              {status !== 'active' && (
                <Link 
                  href="/pricing"
                  className="block text-center mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-[#2A2B2F] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Account Actions</h3>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 