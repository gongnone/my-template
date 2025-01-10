'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { AdTemplate, AdExampleContext } from '@/lib/types/adTemplates';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface AdTemplatesContextType {
  templates: AdTemplate[];
  addTemplate: (template: Omit<AdTemplate, 'id'>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getExamplesForStyle: (style: string, type: 'lead-gen' | 'conversion') => AdExampleContext | null;
}

const AdTemplatesContext = createContext<AdTemplatesContextType | null>(null);

export function AdTemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const { user } = useAuth();

  // Load templates from Firebase
  useEffect(() => {
    if (!user) return;

    const loadTemplates = async () => {
      const templatesRef = collection(db, 'users', user.uid, 'adTemplates');
      const snapshot = await getDocs(templatesRef);
      const loadedTemplates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdTemplate));
      setTemplates(loadedTemplates);
    };

    loadTemplates();
  }, [user]);

  const addTemplate = async (template: Omit<AdTemplate, 'id'>) => {
    if (!user) return;
    
    const templatesRef = collection(db, 'users', user.uid, 'adTemplates');
    await addDoc(templatesRef, template);
    // Reload templates
    const snapshot = await getDocs(templatesRef);
    setTemplates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdTemplate)));
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return;
    
    await deleteDoc(doc(db, 'users', user.uid, 'adTemplates', id));
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const getExamplesForStyle = (style: string, type: 'lead-gen' | 'conversion'): AdExampleContext | null => {
    const matchingTemplates = templates.filter(t => t.style === style && t.type === type);
    
    if (matchingTemplates.length === 0) return null;

    return {
      style,
      type,
      examples: matchingTemplates.map(t => ({
        primaryText: t.primaryText,
        headline: t.headline,
        description: t.description,
      }))
    };
  };

  return (
    <AdTemplatesContext.Provider value={{ templates, addTemplate, deleteTemplate, getExamplesForStyle }}>
      {children}
    </AdTemplatesContext.Provider>
  );
}

export const useAdTemplates = () => {
  const context = useContext(AdTemplatesContext);
  if (!context) throw new Error('useAdTemplates must be used within AdTemplatesProvider');
  return context;
}; 