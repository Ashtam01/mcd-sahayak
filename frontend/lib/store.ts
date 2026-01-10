import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ZoneState {
  selectedZone: string | null;
  setSelectedZone: (zone: string | null) => void;
}

export const useZoneStore = create<ZoneState>((set) => ({
  selectedZone: null, // null = "All Delhi HQ View"
  setSelectedZone: (zone) => set({ selectedZone: zone }),
}));

// Sidebar state - persisted to localStorage
interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);

// Zone options for the dropdown
export const ZONES = [
  { value: 'all', label: '🏢 All Delhi HQ' },
  { value: 'north', label: '🏛️ North Zone' },
  { value: 'south', label: '🏛️ South Zone' },
  { value: 'east', label: '🏛️ East Zone' },
  { value: 'west', label: '🏛️ West Zone' },
  { value: 'central', label: '🏛️ Central Zone' },
  { value: 'new-delhi', label: '🏛️ New Delhi Zone' },
] as const;

export type ZoneValue = typeof ZONES[number]['value'];
