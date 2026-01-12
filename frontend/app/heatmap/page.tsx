'use client';

import { useState, useEffect } from 'react';
import {
  Map,
  Filter,
  Calendar,
  Download,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useZoneStore, ZONES } from '@/lib/store';
import dynamic from 'next/dynamic';
import { fetchHotspots } from '@/lib/api';

// Dynamically import the heatmap component to avoid SSR issues
const DelhiHeatmap = dynamic(
  () => import('@/components/dashboard/DelhiHeatmap').then((mod) => mod.DelhiHeatmap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-slate-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

// Hotspot data


const complaintCategories = [
  { name: 'All Categories', value: 'all' },
  { name: 'Garbage Collection', value: 'garbage' },
  { name: 'Water Supply', value: 'water' },
  { name: 'Street Lights', value: 'lights' },
  { name: 'Road Repair', value: 'roads' },
  { name: 'Drainage', value: 'drainage' },
  { name: 'Encroachment', value: 'encroachment' },
  { name: 'Parking', value: 'parking' },
];


export default function HeatmapPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [category, setCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    async function loadHotspots() {
      const data = await fetchHotspots(selectedZone !== 'all' ? selectedZone : undefined);
      setHotspots(data);
    }
    loadHotspots();
  }, [selectedZone]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'decreasing':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Heatmap</h1>
          <p className="text-slate-500 mt-1">
            Visualize complaint density and identify problem areas across Delhi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Map
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <Layers className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {complaintCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[160px]">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.labelKey.split('.')[1] || zone.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-slate-500">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className={`${isFullscreen ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
          <DelhiHeatmap />
        </div>

        {/* Sidebar - Hotspots */}
        {!isFullscreen && (
          <div className="space-y-4">
            {/* Stats Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Map className="w-4 h-4 text-blue-600" />
                  Map Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-slate-900">847</p>
                    <p className="text-xs text-slate-500">Active Complaints</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-slate-900">12</p>
                    <p className="text-xs text-slate-500">Hotspot Areas</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Critical Zones</span>
                    <span className="font-medium text-red-600">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500">High Priority</span>
                    <span className="font-medium text-orange-600">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500">Medium Priority</span>
                    <span className="font-medium text-yellow-600">4</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotspots List */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Top Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotspots.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{hotspot.area}</p>
                        <p className="text-xs text-slate-500">{hotspot.zone}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(
                          hotspot.severity
                        )}`}
                      >
                        {hotspot.severity}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                          {hotspot.complaints}
                        </span>
                        <span className="text-xs text-slate-400">complaints</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(hotspot.trend)}
                        <span className="text-xs text-slate-500 capitalize">{hotspot.trend}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
                        {hotspot.mainIssue}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Map Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 bg-red-500 rounded-full" />
                    <span className="text-sm text-slate-600">Critical (&gt;200 complaints)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 bg-orange-500 rounded-full" />
                    <span className="text-sm text-slate-600">High (100-200)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-slate-600">Medium (50-100)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-sm text-slate-600">Low (&lt;50)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Area Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Area-wise Complaint Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Area</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Zone</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Pending</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Resolved</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Main Issue</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Severity</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Trend</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((hotspot) => (
                  <tr key={hotspot.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{hotspot.area}</td>
                    <td className="py-3 px-4 text-slate-600">{hotspot.zone}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-900">
                      {hotspot.complaints}
                    </td>
                    <td className="py-3 px-4 text-center text-orange-600">
                      {Math.floor(hotspot.complaints * 0.3)}
                    </td>
                    <td className="py-3 px-4 text-center text-green-600">
                      {Math.floor(hotspot.complaints * 0.7)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700">
                        {hotspot.mainIssue}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(
                          hotspot.severity
                        )}`}
                      >
                        {hotspot.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(hotspot.trend)}
                        <span className="text-xs text-slate-500 capitalize">{hotspot.trend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
