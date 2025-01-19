import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/lib/hooks/useAuth';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'none';

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('none');
  const [planType, setPlanType] = useState<'PRO' | 'AGENCY' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStatus('none');
      setPlanType(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'subscriptions', user.uid),
      (doc) => {
        if (doc.exists()) {
          setStatus(doc.data().status as SubscriptionStatus);
          setPlanType(doc.data().planType as 'PRO' | 'AGENCY');
        } else {
          setStatus('none');
          setPlanType(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { status, planType, loading };
} 