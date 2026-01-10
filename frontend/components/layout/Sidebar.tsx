'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Mail,
  Megaphone,
  BookOpen,
  Settings,
  User,
  LogOut,
  Map,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { name: 'Complaints', href: '/complaints', icon: Mail },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Heatmap', href: '/heatmap', icon: Map },
  { name: 'Broadcast', href: '/broadcast', icon: Megaphone },
  { name: 'Schemes', href: '/schemes', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <div className={cn(
          'flex items-center transition-all duration-300',
          isCollapsed ? 'justify-center' : 'gap-3 px-2'
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}>
            <h1 className="text-lg font-bold text-blue-600 tracking-tight whitespace-nowrap">Sampark</h1>
            <p className="text-xs text-slate-500 whitespace-nowrap">MCD 311 Admin</p>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 z-50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-xl transition-all duration-200 group relative',
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-colors flex-shrink-0',
                      isActive
                        ? 'text-blue-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span className={cn(
                    'font-medium whitespace-nowrap overflow-hidden transition-all duration-300',
                    isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  )}>
                    {item.name}
                  </span>
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                  {isActive && isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-200">
        <div className={cn(
          'flex items-center bg-slate-50 rounded-xl transition-all duration-300',
          isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
        )}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className={cn(
            'flex-1 min-w-0 overflow-hidden transition-all duration-300',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}>
            <p className="text-sm font-medium text-slate-900 truncate">Admin Officer</p>
            <p className="text-xs text-slate-500 truncate">Zone HQ</p>
          </div>
          <Link
            href="/login"
            className={cn(
              'p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0',
              isCollapsed && 'absolute bottom-16 left-1/2 -translate-x-1/2'
            )}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
