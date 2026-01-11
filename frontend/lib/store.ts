import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLanguage, setLanguage as setI18nLanguage, type Language } from './i18n';

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

// Language state - persisted to localStorage
interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: getLanguage(),
      setLanguage: (lang) => {
        setI18nLanguage(lang); // Update i18n module
        set({ language: lang }); // Update Zustand store
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

// All 12 Delhi Zones (MCD Official Zones)
export const ZONES = [
  { value: 'all', labelKey: 'zones.allDelhi' },
  { value: 'central', labelKey: 'zones.centralZone' },
  { value: 'city', labelKey: 'zones.cityZone' },
  { value: 'civil-lines', labelKey: 'zones.civilLinesZone' },
  { value: 'karol-bagh', labelKey: 'zones.karolBaghZone' },
  { value: 'keshav-puram', labelKey: 'zones.keshavPuramZone' },
  { value: 'najafgarh', labelKey: 'zones.najafgarhZone' },
  { value: 'narela', labelKey: 'zones.narelaZone' },
  { value: 'rohini', labelKey: 'zones.rohiniZone' },
  { value: 'shahdara-north', labelKey: 'zones.shahdaraNorthZone' },
  { value: 'shahdara-south', labelKey: 'zones.shahdaraSouthZone' },
  { value: 'south', labelKey: 'zones.southZone' },
  { value: 'west', labelKey: 'zones.westZone' },
] as const;

export type ZoneValue = typeof ZONES[number]['value'];
