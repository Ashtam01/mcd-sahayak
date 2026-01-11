'use client';

/**
 * CityIntelligenceLayer - Maplibre GL Version
 * 
 * This version works with maplibre-gl directly (for Delhi3DMap.tsx)
 * Use CityIntelligenceLayer.tsx if you're using react-map-gl
 */

import { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Lightbulb, Droplets, Wind, X, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data Constants
const DARK_SPOTS = [
  { id: 1, lat: 28.7041, lng: 77.1025, location: 'Rohini Sec 16', status: 'Critical' },
  { id: 2, lat: 28.6328, lng: 77.2197, location: 'Connaught Place Outer', status: 'Reported' },
  { id: 3, lat: 28.5355, lng: 77.3910, location: 'Noida Link Road', status: 'Critical' },
  { id: 4, lat: 28.6139, lng: 77.2090, location: 'Central Delhi', status: 'Reported' },
  { id: 5, lat: 28.6677, lng: 77.1652, location: 'Zakhira Area', status: 'Critical' },
];

const FLOOD_HOTSPOTS = [
  { id: 1, lat: 28.6290, lng: 77.2250, name: 'Minto Bridge (Severe)' },
  { id: 2, lat: 28.6677, lng: 77.1652, name: 'Zakhira Flyover' },
  { id: 3, lat: 28.5862, lng: 77.2885, name: 'Ashram Underpass' },
  { id: 4, lat: 28.7041, lng: 77.1025, name: 'Rohini Sector 16' },
  { id: 5, lat: 28.6328, lng: 77.2197, name: 'Connaught Place' },
];

// AQI Interface
interface AQIData {
  aqi: number;
  city?: {
    name?: string;
  };
}

interface CityIntelligenceLayerMaplibreProps {
  map: maplibregl.Map | null;
}

export function CityIntelligenceLayerMaplibre({ map }: CityIntelligenceLayerMaplibreProps) {
  const [showDarkness, setShowDarkness] = useState(false);
  const [showFlood, setShowFlood] = useState(false);
  const [showAQI, setShowAQI] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [isLoadingAQI, setIsLoadingAQI] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupsRef = useRef<maplibregl.Popup[]>([]);

  // Fetch AQI Data
  useEffect(() => {
    if (!showAQI) return;

    const fetchAQI = async () => {
      setIsLoadingAQI(true);
      try {
        const AQI_TOKEN = process.env.NEXT_PUBLIC_AQI_TOKEN || 'demo';
        const response = await fetch(
          `https://api.waqi.info/feed/new-delhi/?token=${AQI_TOKEN}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch AQI data');
        }

        const data = await response.json();
        if (data.status === 'ok' && data.data) {
          setAqiData({
            aqi: data.data.aqi || 0,
            city: data.data.city || {},
          });
        }
      } catch (error) {
        console.error('Error fetching AQI:', error);
        setAqiData({ aqi: 150 });
      } finally {
        setIsLoadingAQI(false);
      }
    };

    fetchAQI();
    const interval = setInterval(fetchAQI, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showAQI]);

  // Render Darkness & Safety Layer
  useEffect(() => {
    if (!map) return;

    // Clean up previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    popupsRef.current.forEach((popup) => popup.remove());
    popupsRef.current = [];

    // Remove existing layers and sources
    if (map.getLayer('dark-spots-circles')) map.removeLayer('dark-spots-circles');
    if (map.getLayer('dark-spots-halo')) map.removeLayer('dark-spots-halo');
    if (map.getSource('dark-spots')) map.removeSource('dark-spots');

    if (showDarkness) {
      const darkSpotsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: DARK_SPOTS.map((spot) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [spot.lng, spot.lat],
          },
          properties: {
            id: spot.id,
            location: spot.location,
            status: spot.status,
          },
        })),
      };

      map.addSource('dark-spots', {
        type: 'geojson',
        data: darkSpotsGeoJSON,
      } as any);

      // Halo layer (larger, blurred)
      map.addLayer({
        id: 'dark-spots-halo',
        type: 'circle',
        source: 'dark-spots',
        paint: {
          'circle-color': '#FFD700',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 20,
            15, 30,
            18, 40,
          ],
          'circle-opacity': 0.3,
          'circle-blur': 1,
        },
      } as any);

      // Main circles
      map.addLayer({
        id: 'dark-spots-circles',
        type: 'circle',
        source: 'dark-spots',
        paint: {
          'circle-color': '#FFD700',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 8,
            15, 12,
            18, 16,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.9,
        },
      } as any);

      // Add click handlers
      map.on('click', 'dark-spots-circles', (e) => {
        const feature = e.features?.[0];
        if (feature) {
          const props = feature.properties;
          const popup = new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="padding: 12px; min-width: 200px; font-family: 'Inter', sans-serif;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
                    <path d="M9 21h6M12 3v18m-4-4a4 4 0 0 1 8 0" />
                  </svg>
                  <span style="font-weight: 600; color: #0f172a;">Broken Streetlight</span>
                </div>
                <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 8px;">${props.location}</p>
                <span style="font-size: 0.75rem; padding: 4px 8px; border-radius: 12px; background: ${
                  props.status === 'Critical' ? '#fee2e2' : '#fef3c7'
                }; color: ${props.status === 'Critical' ? '#dc2626' : '#d97706'};">
                  ${props.status}
                </span>
              </div>
            `)
            .addTo(map);
          popupsRef.current.push(popup);
        }
      });

      map.on('mouseenter', 'dark-spots-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'dark-spots-circles', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    return () => {
      if (map.getLayer('dark-spots-circles')) map.removeLayer('dark-spots-circles');
      if (map.getLayer('dark-spots-halo')) map.removeLayer('dark-spots-halo');
      if (map.getSource('dark-spots')) map.removeSource('dark-spots');
      markersRef.current.forEach((marker) => marker.remove());
      popupsRef.current.forEach((popup) => popup.remove());
    };
  }, [map, showDarkness]);

  // Render Flood Risk Layer
  useEffect(() => {
    if (!map) return;

    // Remove existing layers
    if (map.getLayer('flood-hotspots-circles')) map.removeLayer('flood-hotspots-circles');
    if (map.getLayer('flood-hotspots-pulse')) map.removeLayer('flood-hotspots-pulse');
    if (map.getSource('flood-hotspots')) map.removeSource('flood-hotspots');

    if (showFlood) {
      const floodHotspotsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: FLOOD_HOTSPOTS.map((spot) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [spot.lng, spot.lat],
          },
          properties: {
            id: spot.id,
            name: spot.name,
          },
        })),
      };

      map.addSource('flood-hotspots', {
        type: 'geojson',
        data: floodHotspotsGeoJSON,
      } as any);

      // Pulse layer
      map.addLayer({
        id: 'flood-hotspots-pulse',
        type: 'circle',
        source: 'flood-hotspots',
        paint: {
          'circle-color': '#00BFFF',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 25,
            15, 40,
            18, 55,
          ],
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0.2,
            15, 0.3,
            18, 0.4,
          ],
          'circle-blur': 0.5,
        },
      } as any);

      // Main circles
      map.addLayer({
        id: 'flood-hotspots-circles',
        type: 'circle',
        source: 'flood-hotspots',
        paint: {
          'circle-color': '#00BFFF',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 15,
            15, 25,
            18, 35,
          ],
          'circle-opacity': 0.6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#00BFFF',
          'circle-stroke-opacity': 0.8,
        },
      } as any);

      // Add click handlers
      map.on('click', 'flood-hotspots-circles', (e) => {
        const feature = e.features?.[0];
        if (feature) {
          const props = feature.properties;
          const popup = new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="padding: 12px; min-width: 200px; font-family: 'Inter', sans-serif;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00BFFF" stroke-width="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <span style="font-weight: 600; color: #0f172a;">Flood Hotspot</span>
                </div>
                <p style="font-size: 0.875rem; color: #64748b;">${props.name}</p>
              </div>
            `)
            .addTo(map);
          popupsRef.current.push(popup);
        }
      });

      map.on('mouseenter', 'flood-hotspots-circles', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'flood-hotspots-circles', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    return () => {
      if (map.getLayer('flood-hotspots-circles')) map.removeLayer('flood-hotspots-circles');
      if (map.getLayer('flood-hotspots-pulse')) map.removeLayer('flood-hotspots-pulse');
      if (map.getSource('flood-hotspots')) map.removeSource('flood-hotspots');
    };
  }, [map, showFlood]);

  // Calculate AQI overlay color
  const aqiOverlayColor =
    !aqiData
      ? 'rgba(0, 255, 0, 0.1)'
      : aqiData.aqi <= 100
        ? 'rgba(0, 255, 0, 0.1)'
        : aqiData.aqi <= 300
          ? 'rgba(255, 165, 0, 0.2)'
          : 'rgba(139, 0, 0, 0.4)';

  const aqiStatus =
    !aqiData
      ? 'Loading...'
      : aqiData.aqi <= 100
        ? 'Clean'
        : aqiData.aqi <= 300
          ? 'Moderate Smog'
          : 'Hazardous';

  return (
    <>
      {/* Control Panel - Glassmorphism Style */}
      <div
        className={cn(
          'absolute top-4 right-4 z-50 transition-all duration-300',
          isCollapsed ? 'w-14' : 'w-80'
        )}
      >
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              {!isCollapsed && (
                <span className="text-sm font-bold tracking-wide">City Intelligence</span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isCollapsed ? <Layers className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
          </div>

          {/* Toggle Controls */}
          {!isCollapsed && (
            <div className="p-4 space-y-3">
              {/* Darkness & Safety Toggle */}
              <button
                onClick={() => setShowDarkness(!showDarkness)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200',
                  showDarkness
                    ? 'bg-yellow-50 border-yellow-300 shadow-lg shadow-yellow-200/50'
                    : 'bg-white/50 border-slate-200 hover:border-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    showDarkness ? 'bg-yellow-100' : 'bg-slate-100'
                  )}
                >
                  <Lightbulb
                    className={cn('w-5 h-5', showDarkness ? 'text-yellow-600' : 'text-slate-400')}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm text-slate-900">Darkness & Safety</div>
                  <div className="text-xs text-slate-500">Broken Streetlights</div>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    showDarkness
                      ? 'bg-yellow-500 border-yellow-500'
                      : 'bg-white border-slate-300'
                  )}
                >
                  {showDarkness && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Flood Risk Toggle */}
              <button
                onClick={() => setShowFlood(!showFlood)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200',
                  showFlood
                    ? 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-200/50'
                    : 'bg-white/50 border-slate-200 hover:border-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    showFlood ? 'bg-blue-100' : 'bg-slate-100'
                  )}
                >
                  <Droplets className={cn('w-5 h-5', showFlood ? 'text-blue-600' : 'text-slate-400')} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm text-slate-900">Flood Risk</div>
                  <div className="text-xs text-slate-500">Waterlogging Hotspots</div>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    showFlood ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'
                  )}
                >
                  {showFlood && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Live Atmosphere Toggle */}
              <button
                onClick={() => setShowAQI(!showAQI)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200',
                  showAQI
                    ? 'bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-200/50'
                    : 'bg-white/50 border-slate-200 hover:border-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    showAQI ? 'bg-emerald-100' : 'bg-slate-100'
                  )}
                >
                  <Wind className={cn('w-5 h-5', showAQI ? 'text-emerald-600' : 'text-slate-400')} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm text-slate-900">Live Atmosphere</div>
                  <div className="text-xs text-slate-500">
                    {isLoadingAQI ? 'Loading AQI...' : aqiData ? `AQI: ${aqiData.aqi} (${aqiStatus})` : 'Real-Time AQI'}
                  </div>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    showAQI ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                  )}
                >
                  {showAQI && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AQI Atmosphere Overlay - Full Screen Tint */}
      {showAQI && (
        <div
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            backgroundColor: aqiOverlayColor,
            transition: 'background-color 0.5s ease-in-out',
          }}
        />
      )}
    </>
  );
}
