'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { DeepgramProvider } from '@/lib/contexts/DeepgramContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DeepgramProvider>
        {children}
      </DeepgramProvider>
    </AuthProvider>
  );
} 