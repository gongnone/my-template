'use client';

import DashboardLayout from '@/app/components/DashboardLayout';
import AdCreativesLibrary from '@/app/components/AdCreativesLibrary';

export default function CreativesPage() {
  return (
    <DashboardLayout>
      <div className="h-full overflow-y-auto p-6">
        <AdCreativesLibrary />
      </div>
    </DashboardLayout>
  );
} 