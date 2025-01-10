'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#2A2B2F] text-white">
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <Breadcrumb />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
} 