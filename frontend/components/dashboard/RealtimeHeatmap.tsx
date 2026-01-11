'use client';

import dynamic from 'next/dynamic';
import { type Complaint } from '@/lib/supabase';

// Dynamically import the Delhi Map component with no SSR
const DelhiMap = dynamic(
  () => import('./DelhiMap').then((mod) => mod.DelhiMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-600">Loading Delhi map...</p>
        </div>
      </div>
    ),
  }
);

interface RealtimeHeatmapProps {
  onComplaintSelect?: (complaint: Complaint) => void;
}

export function RealtimeHeatmap({ onComplaintSelect }: RealtimeHeatmapProps = {}) {
  return <DelhiMap onComplaintSelect={onComplaintSelect} />;
}
