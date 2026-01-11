'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCw, Maximize2, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from '@/components/ui/button';

// Dynamically import the 3D map component with no SSR
const Delhi3DMap = dynamic(
  () => import('@/components/dashboard/Delhi3DMap').then((mod) => mod.Delhi3DMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading 3D Delhi Map...</p>
          <p className="text-sm text-slate-400 mt-2">Initializing MapTiler and 3D rendering</p>
        </div>
      </div>
    ),
  }
);

export default function Delhi3DPage() {
  const t = useTranslation();
  const router = useRouter();

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Delhi 3D Command Map</h1>
                <p className="text-sm text-slate-600">Interactive 3D visualization of civic intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-slate-700">Critical</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-xs font-medium text-slate-700">Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-slate-700">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Map Container - Full Screen */}
      <div className="flex-1 relative">
        <Delhi3DMap />
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg z-20">
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-900 mb-2">Controls:</p>
          <p>🖱️ <strong>Drag:</strong> Pan</p>
          <p>🔍 <strong>Scroll:</strong> Zoom</p>
          <p>🔄 <strong>Right-click + Drag:</strong> Rotate</p>
          <p>📐 <strong>Ctrl + Scroll:</strong> Pitch</p>
        </div>
      </div>
    </div>
  );
}
