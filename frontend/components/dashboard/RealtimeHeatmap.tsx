'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, RefreshCw } from 'lucide-react';

// Dynamically import the map component with no SSR
const DelhiHeatmap = dynamic(
  () => import('./DelhiHeatmap').then((mod) => mod.DelhiHeatmap),
  {
    ssr: false,
    loading: () => (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Real-Time Complaint Heatmap</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] w-full flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-slate-600">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  }
);

export function RealtimeHeatmap() {
  return <DelhiHeatmap />;
}
