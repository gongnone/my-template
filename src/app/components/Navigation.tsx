import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-[#1F2023] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-4 text-white font-medium"
            >
              Home
            </Link>
            <Link
              href="/settings/prompts"
              className="flex items-center px-4 text-gray-400 hover:text-white"
            >
              Prompt Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 