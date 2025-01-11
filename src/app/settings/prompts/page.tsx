import AdPromptSettings from '@/app/components/AdPromptSettings';
import Link from 'next/link';

export default function PromptSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/"
          className="text-gray-400 hover:text-white inline-flex items-center"
        >
          ← Back to Home
        </Link>
      </div>
      <AdPromptSettings />
    </div>
  );
} 