'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, RefreshCw, Layers } from 'lucide-react';
import { supabase, type HeatmapPoint } from '@/lib/supabase';
import { useZoneStore } from '@/lib/store';

// Delhi center coordinates
const DELHI_CENTER: [number, number] = [28.6139, 77.209];

// Zone-specific coordinates and bounds
const ZONE_COORDINATES: Record<string, { center: [number, number]; zoom: number; bounds: { north: number; south: number; east: number; west: number } }> = {
  all: {
    center: [28.6139, 77.209],
    zoom: 11,
    bounds: { north: 28.88, south: 28.40, east: 77.35, west: 76.84 },
  },
  north: {
    center: [28.7500, 77.1167],
    zoom: 12,
    bounds: { north: 28.85, south: 28.68, east: 77.25, west: 77.00 },
  },
  south: {
    center: [28.5245, 77.2066],
    zoom: 12,
    bounds: { north: 28.60, south: 28.45, east: 77.30, west: 77.10 },
  },
  east: {
    center: [28.6280, 77.2950],
    zoom: 12,
    bounds: { north: 28.70, south: 28.55, east: 77.38, west: 77.22 },
  },
  west: {
    center: [28.6517, 77.0460],
    zoom: 12,
    bounds: { north: 28.72, south: 28.58, east: 77.15, west: 76.95 },
  },
  central: {
    center: [28.6328, 77.2197],
    zoom: 13,
    bounds: { north: 28.68, south: 28.58, east: 77.28, west: 77.16 },
  },
  'new-delhi': {
    center: [28.6139, 77.2090],
    zoom: 13,
    bounds: { north: 28.65, south: 28.56, east: 77.25, west: 77.15 },
  },
};

// Zone polygon boundaries (approximate shapes for Delhi zones)
const ZONE_POLYGONS: Record<string, [number, number][]> = {
  north: [
    [28.85, 76.98],
    [28.85, 77.25],
    [28.75, 77.28],
    [28.68, 77.22],
    [28.68, 77.00],
    [28.72, 76.98],
  ],
  south: [
    [28.60, 77.08],
    [28.60, 77.32],
    [28.52, 77.35],
    [28.45, 77.30],
    [28.42, 77.15],
    [28.48, 77.08],
  ],
  east: [
    [28.72, 77.22],
    [28.72, 77.40],
    [28.62, 77.42],
    [28.55, 77.35],
    [28.55, 77.22],
    [28.62, 77.20],
  ],
  west: [
    [28.74, 76.82],
    [28.74, 77.08],
    [28.68, 77.15],
    [28.58, 77.12],
    [28.55, 76.95],
    [28.62, 76.82],
  ],
  central: [
    [28.70, 77.15],
    [28.70, 77.30],
    [28.64, 77.32],
    [28.58, 77.28],
    [28.58, 77.15],
    [28.64, 77.13],
  ],
  'new-delhi': [
    [28.66, 77.14],
    [28.66, 77.26],
    [28.60, 77.28],
    [28.55, 77.24],
    [28.55, 77.16],
    [28.60, 77.14],
  ],
};

// Zone-specific hotspots
const ZONE_HOTSPOTS: Record<string, { lat: number; lng: number; weight: number; area: string }[]> = {
  all: [
    { lat: 28.7041, lng: 77.1025, weight: 0.9, area: 'Rohini' },
    { lat: 28.5245, lng: 77.1855, weight: 0.8, area: 'Saket' },
    { lat: 28.6448, lng: 77.2167, weight: 0.85, area: 'Karol Bagh' },
    { lat: 28.6280, lng: 77.2788, weight: 0.7, area: 'Laxmi Nagar' },
    { lat: 28.6517, lng: 77.0460, weight: 0.75, area: 'Dwarka' },
    { lat: 28.6692, lng: 77.4538, weight: 0.6, area: 'Noida Border' },
  ],
  north: [
    { lat: 28.7500, lng: 77.1167, weight: 0.9, area: 'Model Town' },
    { lat: 28.7260, lng: 77.1103, weight: 0.85, area: 'Azadpur' },
    { lat: 28.7041, lng: 77.1025, weight: 0.8, area: 'Rohini Sector 7' },
    { lat: 28.7380, lng: 77.1500, weight: 0.7, area: 'GTB Nagar' },
  ],
  south: [
    { lat: 28.5245, lng: 77.1855, weight: 0.9, area: 'Saket' },
    { lat: 28.5672, lng: 77.2100, weight: 0.85, area: 'Hauz Khas' },
    { lat: 28.5355, lng: 77.2500, weight: 0.8, area: 'Kalkaji' },
    { lat: 28.4900, lng: 77.1700, weight: 0.7, area: 'Mehrauli' },
  ],
  east: [
    { lat: 28.6280, lng: 77.2788, weight: 0.9, area: 'Laxmi Nagar' },
    { lat: 28.6350, lng: 77.3150, weight: 0.85, area: 'Preet Vihar' },
    { lat: 28.6500, lng: 77.2700, weight: 0.8, area: 'Shahdara' },
    { lat: 28.6100, lng: 77.3000, weight: 0.7, area: 'Mayur Vihar' },
  ],
  west: [
    { lat: 28.6517, lng: 77.0460, weight: 0.9, area: 'Dwarka Sector 12' },
    { lat: 28.6700, lng: 77.0300, weight: 0.85, area: 'Janakpuri' },
    { lat: 28.6350, lng: 77.0650, weight: 0.8, area: 'Uttam Nagar' },
    { lat: 28.6900, lng: 77.0800, weight: 0.7, area: 'Rajouri Garden' },
  ],
  central: [
    { lat: 28.6448, lng: 77.2167, weight: 0.9, area: 'Karol Bagh' },
    { lat: 28.6328, lng: 77.2197, weight: 0.85, area: 'Paharganj' },
    { lat: 28.6562, lng: 77.2410, weight: 0.8, area: 'Daryaganj' },
    { lat: 28.6200, lng: 77.2300, weight: 0.7, area: 'ITO' },
  ],
  'new-delhi': [
    { lat: 28.6139, lng: 77.2090, weight: 0.9, area: 'Connaught Place' },
    { lat: 28.5950, lng: 77.2100, weight: 0.85, area: 'India Gate' },
    { lat: 28.6250, lng: 77.2000, weight: 0.8, area: 'Janpath' },
    { lat: 28.6100, lng: 77.2300, weight: 0.7, area: 'Mandi House' },
  ],
};

// Generate mock heatmap data points for a zone
function generateMockPoints(zone: string, count: number): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  const hotspots = ZONE_HOTSPOTS[zone] || ZONE_HOTSPOTS.all;
  const bounds = ZONE_COORDINATES[zone]?.bounds || ZONE_COORDINATES.all.bounds;

  hotspots.forEach((hotspot) => {
    const clusterCount = Math.floor(count * hotspot.weight / hotspots.length);
    for (let i = 0; i < clusterCount; i++) {
      const variance = 0.015 * (1 - hotspot.weight + 0.3);
      points.push({
        lat: hotspot.lat + (Math.random() - 0.5) * variance,
        lng: hotspot.lng + (Math.random() - 0.5) * variance,
        intensity: 0.5 + Math.random() * 0.5,
      });
    }
  });

  // Add scattered points
  for (let i = 0; i < count * 0.15; i++) {
    points.push({
      lat: bounds.south + Math.random() * (bounds.north - bounds.south),
      lng: bounds.west + Math.random() * (bounds.east - bounds.west),
      intensity: 0.3 + Math.random() * 0.4,
    });
  }

  return points;
}

function getColor(intensity: number): string {
  if (intensity > 0.8) return '#ef4444';
  if (intensity > 0.6) return '#f97316';
  if (intensity > 0.4) return '#eab308';
  return '#22c55e';
}

export function DelhiHeatmap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const zoneBorderRef = useRef<L.Polygon | null>(null);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { selectedZone } = useZoneStore();

  // Get current zone key
  const currentZone = selectedZone || 'all';
  const zoneConfig = ZONE_COORDINATES[currentZone] || ZONE_COORDINATES.all;

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map instance
    mapRef.current = L.map(mapContainerRef.current).setView(DELHI_CENTER, 11);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Zoom to selected zone and add mask when it changes
  useEffect(() => {
    if (!mapRef.current) return;

    const config = ZONE_COORDINATES[currentZone] || ZONE_COORDINATES.all;
    
    // Fly to zone
    mapRef.current.flyTo(config.center, config.zoom, {
      duration: 1,
      easeLinearity: 0.25,
    });

    // Remove existing mask and border
    if (maskLayerRef.current) {
      maskLayerRef.current.remove();
      maskLayerRef.current = null;
    }
    if (zoneBorderRef.current) {
      zoneBorderRef.current.remove();
      zoneBorderRef.current = null;
    }

    // Add mask for non-selected zones (only if a specific zone is selected)
    if (currentZone !== 'all' && ZONE_POLYGONS[currentZone]) {
      const zonePolygon = ZONE_POLYGONS[currentZone];
      
      // Create a large outer boundary (covers entire visible area)
      const outerBounds: [number, number][] = [
        [29.5, 76.0],
        [29.5, 78.0],
        [27.5, 78.0],
        [27.5, 76.0],
      ];
      
      // Create mask polygon with hole (selected zone is the hole)
      // The outer ring goes clockwise, inner ring (hole) goes counter-clockwise
      const maskCoords = [
        outerBounds,
        [...zonePolygon].reverse() as [number, number][], // Reverse to create hole
      ];
      
      maskLayerRef.current = L.polygon(maskCoords, {
        color: 'transparent',
        fillColor: '#1e293b',
        fillOpacity: 0.5,
        interactive: false,
      }).addTo(mapRef.current);

      // Add highlighted border around selected zone
      zoneBorderRef.current = L.polygon(zonePolygon, {
        color: '#3b82f6',
        weight: 3,
        fillColor: 'transparent',
        fillOpacity: 0,
        dashArray: '10, 5',
        interactive: false,
      }).addTo(mapRef.current);
    }
  }, [currentZone]);

  // Update markers when points change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    heatmapPoints.slice(0, 200).forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 8 + (point.intensity || 0.5) * 6,
        fillColor: getColor(point.intensity || 0.5),
        fillOpacity: 0.6,
        stroke: false,
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div class="text-sm">
          <p class="font-medium">Complaint Cluster</p>
          <p class="text-slate-500">Intensity: ${Math.round((point.intensity || 0.5) * 100)}%</p>
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [heatmapPoints]);

  // Initial data fetch - refetch when zone changes
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      
      try {
        // Build query with zone filter
        let query = supabase
          .from('complaints')
          .select('latitude, longitude, priority')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .order('created_at', { ascending: false })
          .limit(500);

        if (currentZone !== 'all') {
          query = query.eq('zone', currentZone);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase error:', error);
          // Show empty state instead of mock data
          setHeatmapPoints([]);
        } else if (data && data.length > 0) {
          // Map priority to intensity
          const priorityIntensity: Record<string, number> = {
            critical: 1.0,
            high: 0.8,
            medium: 0.6,
            low: 0.4,
          };
          
          const points = data
            .filter(row => row.latitude && row.longitude)
            .map((row) => ({
              lat: row.latitude,
              lng: row.longitude,
              intensity: priorityIntensity[row.priority as string] || 0.5,
            }));
          setHeatmapPoints(points);
        } else {
          // No data - show empty state (no mock data!)
          setHeatmapPoints([]);
        }
      } catch (err) {
        console.error('Failed to fetch heatmap data:', err);
        setHeatmapPoints([]);
      }
      
      setIsLoading(false);
      setLastUpdate(new Date());
    }

    fetchInitialData();
  }, [currentZone]);

  // Realtime subscription - only for real data
  useEffect(() => {
    const channel = supabase
      .channel('complaints-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'complaints' },
        (payload) => {
          // Only add if it has coordinates
          if (payload.new.latitude && payload.new.longitude) {
            const priorityIntensity: Record<string, number> = {
              critical: 1.0,
              high: 0.8,
              medium: 0.6,
              low: 0.4,
            };
            
            const newPoint: HeatmapPoint = {
              lat: payload.new.latitude,
              lng: payload.new.longitude,
              intensity: priorityIntensity[payload.new.priority as string] || 0.9,
            };
            setHeatmapPoints((prev) => [newPoint, ...prev.slice(0, 499)]);
            setLastUpdate(new Date());
          }
        }
      )
      .subscribe();

    // No more fake interval updates!

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentZone]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Real-Time Complaint Heatmap</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Layers className="w-4 h-4" />
              <span>{heatmapPoints.length} points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-500">
                Live • {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">Density:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-slate-600">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-slate-600">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs text-slate-600">High</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-slate-600">Critical</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[500px] w-full relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-slate-600">Loading complaint data...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={mapContainerRef} 
            className="h-full w-full rounded-b-xl z-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
