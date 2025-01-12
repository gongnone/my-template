import Sidebar from '@/app/components/Sidebar';
import Breadcrumb from '@/app/components/Breadcrumb';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#17181C]">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <Breadcrumb />
        </div>
        {children}
      </main>
    </div>
  );
} 