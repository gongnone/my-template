'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { PLANS } from '@/lib/config/pricing';
import { getStripe } from '@/lib/stripe-config';

export default function PricingPage() {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (planType: 'AGENCY' | 'PRO') => {
    if (!user) {
      alert('Please sign in first');
      return;
    }

    setIsLoading(true);
    try {
      const plan = PLANS[planType];
      const priceId = isAnnual ? plan.annual.priceId : plan.monthly.priceId;

      console.log('Plan Details:', {
        planType,
        isAnnual,
        priceId,
        monthlyPriceId: plan.monthly.priceId,
        annualPriceId: plan.annual.priceId
      });

      if (!priceId) {
        throw new Error('Price ID is not configured');
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      console.log('Session created:', data.sessionId);
      
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-white hover:text-gray-300">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Title Section */}
        <div className="text-center mt-8">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm mb-4">
            🎉 Special Launch Pricing
          </span>
          <h1 className="text-4xl font-bold text-white mb-4">
            Write High-Converting Copy In Seconds. Try It Now 👇
          </h1>
          <p className="text-gray-300 text-lg">
            Paid plans grant you full access to the platform. The agency plan comes with
            the ability to generate additional resources.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <span className="text-white">Save up to 30% on annual plans</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className={`
              w-14 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out
              ${isAnnual ? 'bg-purple-600' : 'bg-gray-600'}
            `}
          >
            <div className={`
              w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out
              ${isAnnual ? 'translate-x-7' : 'translate-x-0'}
            `} />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Agency Plan */}
          <div className="rounded-2xl p-8 bg-purple-600 relative">
            <span className="absolute -top-3 left-4 px-3 py-1 bg-white text-purple-600 rounded-full text-sm font-semibold">
              MOST POPULAR
            </span>
            <h3 className="text-xl font-semibold text-white">Agency Plan</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold text-white">
                ${isAnnual ? '3,297' : '397'}
              </span>
              <span className="text-white/80">{isAnnual ? '/year' : '/month'}</span>
            </p>
            <button 
              onClick={() => handleCheckout('AGENCY')}
              disabled={isLoading}
              className="mt-8 w-full bg-white text-purple-600 rounded-lg py-3 font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Get Started'}
            </button>
            
            {/* Feature list */}
            <div className="mt-8 space-y-4">
              {PLANS.AGENCY.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl p-8 bg-gray-800">
            <h3 className="text-xl font-semibold text-white">Pro Plan</h3>
            <p className="mt-4">
              <span className="text-4xl font-bold text-white">
                ${isAnnual ? '827' : '99'}
              </span>
              <span className="text-white/80">{isAnnual ? '/year' : '/month'}</span>
            </p>
            <button 
              onClick={() => handleCheckout('PRO')}
              disabled={isLoading}
              className="mt-8 w-full bg-purple-600 text-white rounded-lg py-3 font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Get Started'}
            </button>
            
            {/* Feature list */}
            <div className="mt-8 space-y-4">
              {PLANS.PRO.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 