'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link 
            href="/"
            className="text-white hover:text-gray-300 transition-colors"
          >
            ← Back to Voice Notes
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Upgrade Your Account
          </h2>
        </div>

        {/* Simple test pricing card */}
        <div className="mt-12 max-w-md mx-auto bg-gray-800 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-white">Test Plan</h3>
          <p className="mt-4 text-white">
            <span className="text-4xl font-bold">$99</span>/month
          </p>
          <button className="mt-8 w-full bg-purple-600 text-white rounded-lg py-3">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
} 