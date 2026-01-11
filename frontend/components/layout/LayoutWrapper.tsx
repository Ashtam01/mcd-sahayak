'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebarStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Pages that don't need the dashboard layout (public pages and full-screen features)
const noLayoutPaths = ['/', '/login', '/delhi-3d'];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  
  // Check if current path should skip the layout
  const skipLayout = noLayoutPaths.includes(pathname);

  if (skipLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn(
        'flex-1 transition-all duration-300 ease-in-out',
        isCollapsed ? 'ml-[72px]' : 'ml-64'
      )}>
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
