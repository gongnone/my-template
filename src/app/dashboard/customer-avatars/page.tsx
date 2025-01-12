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
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const handleToggleForm = () => {
    setIsTransitioning(true);
    setShowForm(!showForm);
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="space-y-6">
          {showForm ? (
            <>
              <div className="flex items-center gap-4 mb-6">
                <button onClick={handleToggleForm} className="text-gray-400 hover:text-white">
                  ← Back
                </button>
                <h2 className="text-xl font-semibold">Create New Customer Avatar</h2>
              </div>

              <div 
                className={`bg-[#1F2023] rounded-xl p-6 transition-all duration-300 ${
                  isTransitioning ? 'opacity-50 scale-[0.99] blur-[1px]' : 'opacity-100 scale-100 blur-0'
                }`}
              >
                <CustomerAvatarForm onClose={handleToggleForm} />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">Customer Avatars</h2>
                  <span className="text-sm text-gray-400">
                    {avatars.length} {avatars.length === 1 ? 'Avatar' : 'Avatars'}
                  </span>
                </div>
                <button
                  onClick={handleToggleForm}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create New Avatar
                </button>
              </div>

              <div 
                className={`bg-[#1F2023] rounded-xl p-6 transition-all duration-300 ${
                  isTransitioning ? 'opacity-50 scale-[0.99] blur-[1px]' : 'opacity-100 scale-100 blur-0'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="bg-[#2A2B2F] rounded-xl p-6 hover:bg-[#3A3B3F] transition-colors"
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
                          className="text-gray-400 hover:text-red-500 transition-colors"
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 