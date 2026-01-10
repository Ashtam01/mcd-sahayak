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
import { Input } from '@/components/ui/input';

export function TopBar() {
  const { selectedZone, setSelectedZone } = useZoneStore();

  const handleZoneChange = (value: string) => {
    setSelectedZone(value === 'all' ? null : value);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4">
      <div className="flex items-center justify-between gap-6">
        {/* Zone Switcher */}
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-slate-400" />
          <Select
            value={selectedZone || 'all'}
            onValueChange={handleZoneChange}
          >
            <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              {ZONES.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search complaints, tickets, citizens..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-slate-200 rounded-full"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md">
              ENG
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-md transition-colors">
              हिं
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
