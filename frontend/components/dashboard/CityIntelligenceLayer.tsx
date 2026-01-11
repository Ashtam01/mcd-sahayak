'use client';

import { useState, useEffect, useMemo } from 'react';
import { Source, Layer, Marker, Popup } from 'react-map-gl';
import { Lightbulb, Droplets, Wind, X, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MapRef } from 'react-map-gl';

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

interface CityIntelligenceLayerProps {
  mapRef?: React.RefObject<MapRef>;
}

export function CityIntelligenceLayer({ mapRef }: CityIntelligenceLayerProps) {
  const [showDarkness, setShowDarkness] = useState(false);
  const [showFlood, setShowFlood] = useState(false);
  const [showAQI, setShowAQI] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<{ type: string; data: any } | null>(null);
  const [isLoadingAQI, setIsLoadingAQI] = useState(false);

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
        // Fallback to mock data if API fails
        setAqiData({ aqi: 150 });
      } finally {
        setIsLoadingAQI(false);
      }
    };

    fetchAQI();
    // Refresh AQI every 5 minutes
    const interval = setInterval(fetchAQI, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showAQI]);

  // Convert dark spots to GeoJSON
  const darkSpotsGeoJSON = useMemo(() => {
    if (!showDarkness) return null;
    return {
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
  }, [showDarkness]);

  // Convert flood hotspots to GeoJSON
  const floodHotspotsGeoJSON = useMemo(() => {
    if (!showFlood) return null;
    return {
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
  }, [showFlood]);

  // Calculate AQI overlay color
  const aqiOverlayColor = useMemo(() => {
    if (!aqiData) return 'rgba(0, 255, 0, 0.1)';
    const aqi = aqiData.aqi;
    if (aqi <= 100) return 'rgba(0, 255, 0, 0.1)'; // Clean - Green
    if (aqi <= 300) return 'rgba(255, 165, 0, 0.2)'; // Moderate - Orange
    return 'rgba(139, 0, 0, 0.4)'; // Hazardous - Dark Red
  }, [aqiData]);

  // Get AQI status text
  const aqiStatus = useMemo(() => {
    if (!aqiData) return 'Loading...';
    const aqi = aqiData.aqi;
    if (aqi <= 100) return 'Clean';
    if (aqi <= 300) return 'Moderate Smog';
    return 'Hazardous';
  }, [aqiData]);

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
              {isCollapsed ? (
                <Layers className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
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
                  <Droplets
                    className={cn('w-5 h-5', showFlood ? 'text-blue-600' : 'text-slate-400')}
                  />
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
                  <Wind
                    className={cn('w-5 h-5', showAQI ? 'text-emerald-600' : 'text-slate-400')}
                  />
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

      {/* Map Layers */}
      {/* Darkness & Safety Layer - Glowing Yellow Circles */}
      {showDarkness && darkSpotsGeoJSON && (
        <>
          <Source id="dark-spots" type="geojson" data={darkSpotsGeoJSON}>
            <Layer
              id="dark-spots-circles"
              type="circle"
              paint={{
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
                'circle-blur': 0.3,
              }}
            />
            <Layer
              id="dark-spots-halo"
              type="circle"
              paint={{
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
              }}
            />
          </Source>

          {/* Markers with Popups */}
          {DARK_SPOTS.map((spot) => (
            <Marker
              key={`dark-${spot.id}`}
              longitude={spot.lng}
              latitude={spot.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarker({ type: 'dark', data: spot });
              }}
            >
              <div className="cursor-pointer">
                <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_20px_#FFD700] animate-pulse"></div>
              </div>
            </Marker>
          ))}
        </>
      )}

      {/* Flood Risk Layer - Pulsing Blue Zones */}
      {showFlood && floodHotspotsGeoJSON && (
        <>
          <Source id="flood-hotspots" type="geojson" data={floodHotspotsGeoJSON}>
            <Layer
              id="flood-hotspots-circles"
              type="circle"
              paint={{
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
              }}
            />
            <Layer
              id="flood-hotspots-pulse"
              type="circle"
              paint={{
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
              }}
            />
          </Source>

          {/* Markers with Popups */}
          {FLOOD_HOTSPOTS.map((spot) => (
            <Marker
              key={`flood-${spot.id}`}
              longitude={spot.lng}
              latitude={spot.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarker({ type: 'flood', data: spot });
              }}
            >
              <div className="cursor-pointer">
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full opacity-80 animate-ping"></div>
                  <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </Marker>
          ))}
        </>
      )}

      {/* Popups */}
      {selectedMarker && (
        <Popup
          longitude={selectedMarker.data.lng}
          latitude={selectedMarker.data.lat}
          anchor="bottom"
          onClose={() => setSelectedMarker(null)}
          closeButton={true}
          closeOnClick={false}
          className="custom-popup"
        >
          <div className="p-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              {selectedMarker.type === 'dark' ? (
                <Lightbulb className="w-4 h-4 text-yellow-600" />
              ) : (
                <Droplets className="w-4 h-4 text-blue-600" />
              )}
              <span className="font-bold text-sm text-slate-900">
                {selectedMarker.type === 'dark' ? 'Broken Streetlight' : 'Flood Hotspot'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-1">
              {selectedMarker.type === 'dark'
                ? selectedMarker.data.location
                : selectedMarker.data.name}
            </p>
            {selectedMarker.type === 'dark' && (
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  selectedMarker.data.status === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                )}
              >
                {selectedMarker.data.status}
              </span>
            )}
          </div>
        </Popup>
      )}

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
