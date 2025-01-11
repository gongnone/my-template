'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProducts } from '@/lib/contexts/ProductContext';

const navigationItems = [
  {
    title: 'Direct Response Headlines',
    description: 'Generate compelling headlines for direct response marketing',
    icon: '📝',
    href: '/dashboard/headlines'
  },
  {
    title: 'HVCO Titles',
    description: 'Create high-value content offer titles',
    icon: '📚',
    href: '/dashboard/hvco'
  },
  {
    title: 'Hero Mechanisms',
    description: 'Design effective hero sections and mechanisms',
    icon: '🎯',
    href: '/dashboard/hero'
  },
  {
    title: 'Ad Creatives',
    description: 'Generate engaging ad creative content',
    icon: '🎨',
    href: '/dashboard/ads'
  },
  {
    title: 'Facebook Ads',
    description: 'Generate engaging ad creative content',
    icon: '🔥',
    href: '/facebook-ads'
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { products } = useProducts();

  return (
    <aside className="w-64 bg-[#1F2023] min-h-screen p-4 fixed">
      <nav className="space-y-6">
        {navigationItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`flex items-center space-x-3 text-gray-300 hover:text-white ${
              pathname === item.href ? 'text-white bg-white/10 p-2 rounded-lg' : ''
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        ))}
        
        {/* Products Section */}
        <div className="pt-6 mt-6 border-t border-gray-700">
          <Link 
            href="/dashboard/products"
            className={`flex items-center justify-between text-gray-300 hover:text-white ${
              pathname === '/dashboard/products' ? 'text-white bg-white/10 p-2 rounded-lg' : ''
            }`}
          >
            <span className="flex items-center space-x-3">
              <span className="text-xl">📦</span>
              <span>Products</span>
            </span>
            <span className="bg-gray-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">{products.length}</span>
          </Link>
        </div>

        {/* Bottom Controls */}
        <div className="fixed bottom-0 left-0 w-64 bg-[#1F2023] p-4 space-y-4">
          <button className="flex items-center space-x-3 text-gray-300 hover:text-white w-full">
            <span className="text-xl">🌞</span>
            <span>Light Mode</span>
          </button>
          <button className="flex items-center space-x-3 text-gray-300 hover:text-white w-full">
            <span className="text-xl">❓</span>
            <span>Support</span>
          </button>
          <Link
            href="/settings/prompts"
            className="flex items-center space-x-3 text-gray-300 hover:text-white w-full"
          >
            <span className="text-xl">⚙️</span>
            <span>Prompt Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
} 