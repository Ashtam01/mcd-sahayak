'use client';

import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, RefreshCw } from 'lucide-react';
import { supabase, type HeatmapPoint } from '@/lib/supabase';
import { useZoneStore } from '@/lib/store';
import { fetchHeatmapPoints, fetchHotspots } from '@/lib/api';

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
  const clusterMarkersRef = useRef<L.Layer[]>([]); // Ref for cluster markers
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const zoneBorderRef = useRef<L.Polygon | null>(null);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]); // New state for hotspots
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { selectedZone } = useZoneStore();

  const currentZone = selectedZone || 'all';

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

    // Add mask for selected zone (including 'all' for whole Delhi)
    if (ZONE_POLYGONS[currentZone]) {
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
        fillOpacity: 0.8, // Make it darker as requested "in black"
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

    // Clear existing cluster markers
    clusterMarkersRef.current.forEach((layer) => layer.remove());
    clusterMarkersRef.current = [];

    // Add new heatmap points
    heatmapPoints.slice(0, 200).forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 8 + (point.intensity || 0.5) * 6,
        fillColor: getColor(point.intensity || 0.5),
        fillOpacity: 0.6,
        stroke: false,
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div class="text-sm">
          <p class="font-medium">Complaint</p>
          <p class="text-slate-500">Intensity: ${Math.round((point.intensity || 0.5) * 100)}%</p>
        </div>
      `);

      markersRef.current.push(marker);
    });

    // Add HOTSPOT CLUSTERS
    hotspots.forEach((hotspot) => {
      // Create a large, pulsating circle for the hotspot
      const clusterCircle = L.circle([hotspot.lat, hotspot.lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        radius: 400, // ~400m radius
        weight: 2,
        dashArray: '5, 5'
      }).addTo(mapRef.current!);

      // Add a text label or icon in center
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);">${hotspot.complaints}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const centerMarker = L.marker([hotspot.lat, hotspot.lng], { icon }).addTo(mapRef.current!);

      centerMarker.bindPopup(`
            <div class="p-2">
                <h3 class="font-bold text-red-600">${hotspot.area} Hotspot</h3>
                <p class="text-sm font-medium">${hotspot.mainIssue} Issue</p>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">${hotspot.complaints} Complaints</span>
                    <span class="text-xs bg-red-100 px-1.5 py-0.5 rounded text-red-600 uppercase font-bold">${hotspot.severity}</span>
                </div>
            </div>
        `);

      clusterMarkersRef.current.push(clusterCircle);
      clusterMarkersRef.current.push(centerMarker);
    });

  }, [heatmapPoints, hotspots]);

  // Initial data fetch - refetch when zone changes
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);

      try {
        const [pointsData, hotspotsData] = await Promise.all([
          fetchHeatmapPoints(currentZone),
          fetchHotspots(currentZone)
        ]);

        // Backend returns [[lat, lng, intensity], ...], map to object
        const points: HeatmapPoint[] = pointsData.map((p: any) => ({
          lat: p[0],
          lng: p[1],
          intensity: p[2]
        }));
        setHeatmapPoints(points);
        setHotspots(hotspotsData); // Store hotspots

      } catch (err) {
        console.error('Failed to fetch heatmap data:', err);
        setHeatmapPoints([]);
        setHotspots([]);
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

            const lat = payload.new.latitude;
            const lng = payload.new.longitude;

            const newPoint: HeatmapPoint = {
              lat: lat,
              lng: lng,
              intensity: priorityIntensity[payload.new.priority as string] || 0.9,
            };

            setHeatmapPoints((prev) => [newPoint, ...prev.slice(0, 499)]);
            setLastUpdate(new Date());

            // Highlight the new complaint on map
            if (mapRef.current) {
              // Fly to the new location with high zoom
              mapRef.current.flyTo([lat, lng], 16, {
                duration: 2,
                easeLinearity: 0.25
              });

              // Create a special pulsing marker/popup
              const popupContent = `
                <div class="text-sm p-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <p class="font-bold text-slate-900">New Complaint!</p>
                  </div>
                  <p class="text-slate-600 mb-1">${payload.new.category || 'General Issue'}</p>
                  <p class="text-xs text-slate-500">${payload.new.location || 'Unknown Location'}</p>
                </div>
              `;

              L.popup({
                closeButton: false,
                offset: [0, -10],
                className: 'new-complaint-popup'
              })
                .setLatLng([lat, lng])
                .setContent(popupContent)
                .openOn(mapRef.current);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentZone]);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="pb-2.5 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-base font-semibold">Complaint Heatmap</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">
              {heatmapPoints.length}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[320px] w-full relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-600">Loading...</p>
              </div>
            </div>
          )}

          <div
            ref={mapContainerRef}
            className="h-full w-full z-10"
          />

          {/* Compact Legend Overlay */}
          {!isLoading && (
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm z-30">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-slate-600">Low</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-slate-600">High</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
