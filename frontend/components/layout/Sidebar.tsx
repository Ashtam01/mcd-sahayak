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
  Shield,
  Users,
  FileText,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store';
import { useTranslation, type Translations } from '@/lib/useTranslation';

// NavItem component for reusability
function NavItem({
  item,
  isActive,
  isCollapsed,
  navKey,
  t,
}: {
  item: { nameKey: string; href: string; icon: React.ComponentType<{ className?: string }> };
  isActive: boolean;
  isCollapsed: boolean;
  navKey: keyof typeof t.nav;
  t: Translations;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center rounded-xl transition-all duration-200 group relative',
        isCollapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3',
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100/50'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm'
      )}
      title={isCollapsed ? t.nav[navKey] : undefined}
    >
      <item.icon
        className={cn(
          'w-5 h-5 transition-all flex-shrink-0',
          isActive
            ? 'text-blue-600 scale-110'
            : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-105'
        )}
      />
      <span className={cn(
        'font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-300',
        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
        isActive && 'text-blue-700'
      )}>
        {t.nav[navKey]}
      </span>
      {isActive && !isCollapsed && (
        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full shadow-sm shadow-blue-600/50" />
      )}
      {isActive && isCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full shadow-sm" />
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
          {t.nav[navKey]}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </Link>
  );
}

// Main navigation items (top section)
const mainNavItems = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutGrid },
  { nameKey: 'nav.complaints', href: '/complaints', icon: Mail },
  { nameKey: 'nav.analytics', href: '/analytics', icon: BarChart3 },
  { nameKey: 'nav.heatmap', href: '/heatmap', icon: Map },
  { nameKey: 'nav.delhi3d', href: '/delhi-3d', icon: Layers },
];

// Schemes block items
const schemesItems = [
  { nameKey: 'nav.schemes', href: '/schemes', icon: BookOpen },
];

// Benefits Registry block items
const benefitsRegistryItems = [
  { nameKey: 'nav.benefitsRegistry', href: '/benefits', icon: Users },
];

// Other items (Broadcast, Settings)
const otherItems = [
  { nameKey: 'nav.broadcast', href: '/broadcast', icon: Megaphone },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const t = useTranslation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-lg border-r border-slate-200/50 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-sm',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-5 border-b border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50">
        <div className={cn(
          'flex items-center transition-all duration-300',
          isCollapsed ? 'justify-center' : 'gap-3 px-2'
        )}>
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all hover:scale-105">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap">Sampark</h1>
            <p className="text-xs text-slate-500 whitespace-nowrap font-medium">MCD 311 Admin</p>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-20 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 hover:border-blue-300 hover:shadow-xl transition-all duration-200 z-50 hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
        <div className="space-y-4">
          {/* Main Navigation Section */}
          <ul className="space-y-1.5">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              const navKey = item.nameKey.replace('nav.', '') as keyof typeof t.nav;
              return (
                <li key={item.href}>
                  <NavItem
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    navKey={navKey}
                    t={t}
                  />
                </li>
              );
            })}
          </ul>

          {/* Broadcast - Standalone */}
          <ul className="space-y-1.5">
            {otherItems.filter(item => item.nameKey === 'nav.broadcast').map((item) => {
              const isActive = pathname === item.href;
              const navKey = item.nameKey.replace('nav.', '') as keyof typeof t.nav;
              return (
                <li key={item.href}>
                  <NavItem
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    navKey={navKey}
                    t={t}
                  />
                </li>
              );
            })}
          </ul>

          {/* Schemes Block */}
          {!isCollapsed && (
            <div className="pt-2">
              <div className="px-3 mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Schemes
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-lg p-1.5 border border-emerald-100/50">
                <ul className="space-y-1">
                  {schemesItems.map((item) => {
                    const isActive = pathname === item.href;
                    const navKey = item.nameKey.replace('nav.', '') as keyof typeof t.nav;
                    return (
                      <li key={item.href}>
                        <NavItem
                          item={item}
                          isActive={isActive}
                          isCollapsed={isCollapsed}
                          navKey={navKey}
                          t={t}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* Schemes Block - Collapsed */}
          {isCollapsed && (
            <ul className="space-y-1.5">
              {schemesItems.map((item) => {
                const isActive = pathname === item.href;
                const navKey = item.nameKey.replace('nav.', '') as keyof typeof t.nav;
                return (
                  <li key={item.href}>
                    <NavItem
                      item={item}
                      isActive={isActive}
                      isCollapsed={isCollapsed}
                      navKey={navKey}
                      t={t}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {/* Benefits Registry Block */}
          {!isCollapsed && (
            <div className="pt-2">
              <div className="px-3 mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Benefits Registry
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-lg p-1.5 border border-blue-100/50">
                <ul className="space-y-1">
                  {benefitsRegistryItems.map((item) => {
                    const isActive = pathname === item.href;
                    const navKey = item.nameKey.replace('nav.', '') as keyof typeof t.nav;
                    return (
                      <li key={item.href}>
                        <NavItem
                          item={item}
                          isActive={isActive}
                          isCollapsed={isCollapsed}
                          navKey={navKey}
                          t={t}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* Benefits Registry Block - Collapsed */}
          {isCollapsed && (
            <ul className="space-y-1.5">
              {benefitsRegistryItems.map((item) => {
                const isActive = pathname === item.href;
                const navKey = item.nameKey.replace('nav.', '') as keyof typeof t.nav;
                return (
                  <li key={item.href}>
                    <NavItem
                      item={item}
                      isActive={isActive}
                      isCollapsed={isCollapsed}
                      navKey={navKey}
                      t={t}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {/* Settings - Standalone */}
          <ul className="space-y-1.5 pt-2">
            {otherItems.filter(item => item.nameKey === 'nav.settings').map((item) => {
              const isActive = pathname === item.href;
              const navKey = item.nameKey.replace('nav.', '') as keyof typeof t.nav;
              return (
                <li key={item.href}>
                  <NavItem
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    navKey={navKey}
                    t={t}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-white">
        <div className={cn(
          'flex items-center bg-white rounded-xl transition-all duration-300 border border-slate-200/50 shadow-sm hover:shadow-md',
          isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-200/50 shadow-sm">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className={cn(
            'flex-1 min-w-0 overflow-hidden transition-all duration-300',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}>
            <p className="text-sm font-semibold text-slate-900 truncate">Admin Officer</p>
            <p className="text-xs text-slate-500 truncate font-medium">Zone HQ</p>
          </div>
          <Link
            href="/login"
            className={cn(
              'p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 hover:scale-110',
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
