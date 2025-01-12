'use client';

import { useState, useEffect } from 'react';
import CustomerAvatarForm from '@/app/components/CustomerAvatarForm';

interface CustomerAvatar {
  id: string;
  mainProblem: string;
  currentFrustrations: string;
  urgencyLevel: string;
  ageRange: string;
  location: string;
  incomeLevel: string;
  familyStatus: string;
  mainGoals: string;
  immediateActionTriggers: string;
  purchaseObjections: string;
  informationSources: string;
  preferredContentFormat: string;
  peakEngagementTime: string;
  createdAt: string;
}

export default function CustomerAvatarsPage() {
  const [showForm, setShowForm] = useState(false);
  const [avatars, setAvatars] = useState<CustomerAvatar[]>([]);

  useEffect(() => {
    // Load saved avatars from localStorage
    const savedAvatars = JSON.parse(localStorage.getItem('customer-avatars') || '[]');
    setAvatars(savedAvatars);
  }, []);

  const handleDelete = (id: string) => {
    const updatedAvatars = avatars.filter(avatar => avatar.id !== id);
    localStorage.setItem('customer-avatars', JSON.stringify(updatedAvatars));
    setAvatars(updatedAvatars);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Customer Avatars</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          {showForm ? 'View Avatars' : 'Create New Avatar'}
        </button>
      </div>

      {showForm ? (
        <CustomerAvatarForm />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="bg-[#1F2023] rounded-xl p-6 hover:bg-[#2A2B2F] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">
                    {avatar.ageRange} • {avatar.location}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Created {new Date(avatar.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(avatar.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-1">Main Problem</h4>
                  <p className="text-sm text-gray-300">{avatar.mainProblem}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-1">Demographics</h4>
                  <p className="text-sm text-gray-300">
                    Income: {avatar.incomeLevel} • Family: {avatar.familyStatus}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-1">Goals</h4>
                  <p className="text-sm text-gray-300">{avatar.mainGoals}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-purple-400 mb-1">Behavior</h4>
                  <p className="text-sm text-gray-300">
                    Prefers {avatar.preferredContentFormat} content
                    <br />
                    Most active: {avatar.peakEngagementTime}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {avatars.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No customer avatars yet. Click "Create New Avatar" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 