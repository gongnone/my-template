'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      router.push('/');
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
      }
    };

    verifySession();
  }, [searchParams, router]);

  if (status === 'loading') {
    return <div>Processing your subscription...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Thank you for your subscription!
            </h1>
            <p className="text-gray-600 mb-8">
              Your account has been successfully upgraded.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-8">
              Please contact support if this issue persists.
            </p>
          </>
        )}
        <Link
          href="/dashboard"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
} 