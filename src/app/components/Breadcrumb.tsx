'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);
  
  return (
    <div className="flex items-center space-x-2">
      <Link href="/dashboard" className="text-gray-400 hover:text-white">
        Dashboard
      </Link>
      {paths.map((path, index) => {
        if (index === 0) return null; // Skip 'dashboard' as it's already shown
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;
        
        return (
          <div key={path} className="flex items-center space-x-2">
            <span className="text-gray-600">/</span>
            {isLast ? (
              <span className="text-purple-400 capitalize">
                {path.replace('-', ' ')}
              </span>
            ) : (
              <Link href={href} className="text-gray-400 hover:text-white capitalize">
                {path.replace('-', ' ')}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
} 