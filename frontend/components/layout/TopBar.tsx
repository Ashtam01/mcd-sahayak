'use client';

import { Search, Bell, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useZoneStore, ZONES } from '@/lib/store';
import { useTranslation } from '@/lib/useTranslation';
import { Input } from '@/components/ui/input';
import { LanguageToggle } from '@/components/ui/language-toggle';

export function TopBar() {
  const { selectedZone, setSelectedZone } = useZoneStore();
  const t = useTranslation();

  const handleZoneChange = (value: string) => {
    setSelectedZone(value === 'all' ? null : value);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200/50 px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        {/* Zone Switcher */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <Select
            value={selectedZone || 'all'}
            onValueChange={handleZoneChange}
          >
            <SelectTrigger className="w-[260px] bg-white border-slate-200 hover:border-blue-300 transition-colors shadow-sm font-medium">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <SelectValue placeholder={t.topBar.selectZone} className="truncate" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[400px] w-[280px] shadow-xl border-slate-200">
              <div className="px-2 py-1.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t.topBar.selectZone}
                </p>
              </div>
              {ZONES.map((zone) => {
                // Extract the property name from labelKey (e.g., 'zones.allDelhi' -> 'allDelhi')
                const propertyName = zone.labelKey.replace('zones.', '') as keyof typeof t.zones;
                const label = t.zones[propertyName] || zone.value;
                const isAllZone = zone.value === 'all';
                return (
                  <SelectItem 
                    key={zone.value} 
                    value={zone.value}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <MapPin className={`w-4 h-4 flex-shrink-0 ${
                        isAllZone ? 'text-blue-600' : 'text-slate-400'
                      }`} />
                      <span className="truncate">{label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder={t.topBar.searchPlaceholder}
              className="w-full pl-12 pr-4 py-2.5 bg-white border-slate-200 rounded-full shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all hover:scale-105 group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
            <span className="absolute inset-0 rounded-xl bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </button>

          {/* Language Toggle */}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
