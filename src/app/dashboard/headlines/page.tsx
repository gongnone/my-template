'use client';

import DashboardLayout from '@/app/components/DashboardLayout';

export default function HeadlinesPage() {
  return (
    <>
      <div className="flex items-center space-x-4 mb-8">
        <button className="bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20">
          View Saved Headlines
        </button>
        <button className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700">
          Generate New
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Direct Response Headlines</h1>
      <p className="text-gray-400 mb-8">Generate compelling headlines for your direct response marketing campaigns.</p>

      <div className="bg-[#1F2023] rounded-xl p-6">
        {/* Add headline generation form and results here */}
      </div>
    </>
  );
} 