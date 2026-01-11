'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { supabase, type Complaint } from '@/lib/supabase';
import { useZoneStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
// MapFilters interface moved here since MapControlPanel is removed
export interface MapFilters {
  critical: boolean;
  moderate: boolean;
  resolved: boolean;
  waterBodies: boolean;
  infrastructure: boolean;
  densityHeatmap: boolean;
}
import { fetchCategorizedComplaints, type GeoJSONCollection } from '@/lib/opencity-api';
import { CityIntelligenceLayerMaplibre } from './CityIntelligenceLayerMaplibre';

// Delhi center coordinates
const DELHI_CENTER: [number, number] = [77.2090, 28.6139]; // [lng, lat] for MapLibre
const DELHI_BOUNDS: [[number, number], [number, number]] = [
  [76.8, 28.4], // Southwest [lng, lat]
  [77.4, 28.9], // Northeast [lng, lat]
];

// MapTiler API Key (Free Plan)
const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'sHN1s1vtRq4snu59WwQZ';

// MapTiler style URL with 3D buildings (using streets-v2 for best 3D experience)
// Options: streets-v2, basic-v2, bright-v2, dark-v2, satellite-streets-v2
const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;

// ComplaintMarker interface removed - using GeoJSON layers instead

interface Delhi3DMapProps {
  filters?: MapFilters;
}

const defaultFilters: MapFilters = {
  critical: true,
  moderate: true,
  resolved: true,
  waterBodies: false,
  infrastructure: false,
  densityHeatmap: false,
};

export function Delhi3DMap({ filters = defaultFilters }: Delhi3DMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]); // Kept for potential future use
  const [isLoading, setIsLoading] = useState(true);
  const [geoJsonData, setGeoJsonData] = useState<{
    critical: GeoJSONCollection | null;
    moderate: GeoJSONCollection | null;
    resolved: GeoJSONCollection | null;
    waterBodies: GeoJSONCollection | null;
    infrastructure: GeoJSONCollection | null;
  }>({
    critical: null,
    moderate: null,
    resolved: null,
    waterBodies: null,
    infrastructure: null,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { selectedZone } = useZoneStore();
  const router = useRouter();
  const { toast } = useToast();

  // Initialize 3D Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_STYLE_URL,
      center: DELHI_CENTER,
      zoom: 11,
      pitch: 45, // 3D tilt
      bearing: 0,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: DELHI_BOUNDS,
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    // Load GeoJSON data from OpenCity.in API and static files
    const loadGeoJsonData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch real complaint data from OpenCity.in API
        const complaintsData = await fetchCategorizedComplaints();
        
        // Load static infrastructure and water body data
        const [waterBodies, infrastructure] = await Promise.all([
          fetch('/assets/delhi_water_bodies.json').then(r => r.json()).catch(() => null),
          fetch('/assets/delhi_infrastructure.json').then(r => r.json()).catch(() => null),
        ]);

        setGeoJsonData({
          critical: complaintsData.critical,
          moderate: complaintsData.moderate,
          resolved: complaintsData.resolved,
          waterBodies,
          infrastructure,
        });
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        // Fallback to static files if API fails
        try {
          const [critical, moderate, resolved, waterBodies, infrastructure] = await Promise.all([
            fetch('/assets/critical_complaints.json').then(r => r.json()).catch(() => null),
            fetch('/assets/moderate_complaints.json').then(r => r.json()).catch(() => null),
            fetch('/assets/resolved_complaints.json').then(r => r.json()).catch(() => null),
            fetch('/assets/delhi_water_bodies.json').then(r => r.json()).catch(() => null),
            fetch('/assets/delhi_infrastructure.json').then(r => r.json()).catch(() => null),
          ]);

          setGeoJsonData({
            critical,
            moderate,
            resolved,
            waterBodies,
            infrastructure,
          });
        } catch (fallbackError) {
          console.error('Error loading fallback GeoJSON data:', fallbackError);
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    loadGeoJsonData();

    // Add 3D buildings when map loads
    map.on('load', () => {
      setIsLoading(false);
      
      // Try to add 3D buildings if the source is available
      try {
        const sources = map.getStyle().sources;
        const hasOpenMapTiles = Object.keys(sources).some(key => 
          sources[key as keyof typeof sources] && 
          (sources[key as keyof typeof sources] as any).type === 'vector' &&
          (sources[key as keyof typeof sources] as any).url?.includes('openmaptiles')
        );

        if (hasOpenMapTiles && !map.getLayer('3d-buildings')) {
          map.addLayer({
            id: '3d-buildings',
            source: 'openmaptiles',
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': '#e2e8f0',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                15,
                ['get', 'height'],
              ],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6,
            },
          } as any);
        }
      } catch (error) {
        console.log('3D buildings not available in this style:', error);
      }
    });

    // Handle map errors
    map.on('error', (e) => {
      console.error('Map error:', e);
      if (e.error?.message?.includes('key') || e.error?.message?.includes('API')) {
        toast({
          title: 'MapTiler API Key Required',
          description: 'Please set NEXT_PUBLIC_MAPTILER_API_KEY in your environment variables',
          variant: 'destructive',
        });
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fetch complaints
  useEffect(() => {
    async function fetchComplaints() {
      try {
        let query = supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (selectedZone && selectedZone !== 'all') {
          query = query.eq('zone', selectedZone);
        }

        const { data, error } = await query;

        if (error) throw error;
        setComplaints(data || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setComplaints([]);
      }
    }

    fetchComplaints();

    // Real-time subscription
    const channel = supabase
      .channel('delhi-3d-map-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => {
          fetchComplaints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedZone]);

  // Note: We're using GeoJSON layers for complaint visualization instead of markers
  // The Supabase complaints fetch is kept for potential future real-time overlay
  // but markers are disabled in favor of data-backed GeoJSON layers

  // Render GeoJSON layers based on filters and loaded data
  useEffect(() => {
    if (!mapRef.current || isLoading || isLoadingData) return;

    const map = mapRef.current;

    // Helper function to remove layer and source safely
    const removeLayer = (layerId: string, sourceId?: string) => {
      try {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (sourceId && map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      } catch (error) {
        // Layer or source might not exist, ignore
      }
    };

    // CRITICAL COMPLAINTS LAYER
    if (filters?.critical && geoJsonData.critical) {
      try {
        if (!map.getSource('critical-complaints')) {
          map.addSource('critical-complaints', {
            type: 'geojson',
            data: geoJsonData.critical,
          } as any);
        } else {
          (map.getSource('critical-complaints') as any).setData(geoJsonData.critical);
        }

        if (!map.getLayer('critical-complaints-layer')) {
          map.addLayer({
            id: 'critical-complaints-layer',
            type: 'circle',
            source: 'critical-complaints',
            paint: {
              'circle-color': '#ff0000',
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 4,
                15, 8,
                18, 12,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.9,
            },
          } as any);
        }
      } catch (error) {
        console.error('Error adding critical complaints layer:', error);
      }
    } else {
      removeLayer('critical-complaints-layer', 'critical-complaints');
    }

    // MODERATE COMPLAINTS LAYER
    if (filters?.moderate && geoJsonData.moderate) {
      try {
        if (!map.getSource('moderate-complaints')) {
          map.addSource('moderate-complaints', {
            type: 'geojson',
            data: geoJsonData.moderate,
          } as any);
        } else {
          (map.getSource('moderate-complaints') as any).setData(geoJsonData.moderate);
        }

        if (!map.getLayer('moderate-complaints-layer')) {
          map.addLayer({
            id: 'moderate-complaints-layer',
            type: 'circle',
            source: 'moderate-complaints',
            paint: {
              'circle-color': '#fbb03b',
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 3,
                15, 6,
                18, 10,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.9,
            },
          } as any);
        }
      } catch (error) {
        console.error('Error adding moderate complaints layer:', error);
      }
    } else {
      removeLayer('moderate-complaints-layer', 'moderate-complaints');
    }

    // RESOLVED COMPLAINTS LAYER
    if (filters?.resolved && geoJsonData.resolved) {
      try {
        if (!map.getSource('resolved-complaints')) {
          map.addSource('resolved-complaints', {
            type: 'geojson',
            data: geoJsonData.resolved,
          } as any);
        } else {
          (map.getSource('resolved-complaints') as any).setData(geoJsonData.resolved);
        }

        if (!map.getLayer('resolved-complaints-layer')) {
          map.addLayer({
            id: 'resolved-complaints-layer',
            type: 'circle',
            source: 'resolved-complaints',
            paint: {
              'circle-color': '#00c853',
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 3,
                15, 6,
                18, 10,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.7,
            },
          } as any);
        }
      } catch (error) {
        console.error('Error adding resolved complaints layer:', error);
      }
    } else {
      removeLayer('resolved-complaints-layer', 'resolved-complaints');
    }

    // WATER BODIES LAYER
    if (filters?.waterBodies && geoJsonData.waterBodies) {
      try {
        if (!map.getSource('water-bodies')) {
          map.addSource('water-bodies', {
            type: 'geojson',
            data: geoJsonData.waterBodies,
          } as any);
        } else {
          (map.getSource('water-bodies') as any).setData(geoJsonData.waterBodies);
        }

        // Add line layer for rivers
        if (!map.getLayer('water-bodies-line')) {
          map.addLayer({
            id: 'water-bodies-line',
            type: 'line',
            source: 'water-bodies',
            filter: ['==', ['get', 'type'], 'river'],
            paint: {
              'line-color': '#3bb2d0',
              'line-width': 4,
              'line-opacity': 0.6,
            },
          } as any);
        }

        // Add fill layer for lakes
        if (!map.getLayer('water-bodies-fill')) {
          map.addLayer({
            id: 'water-bodies-fill',
            type: 'fill',
            source: 'water-bodies',
            filter: ['==', ['get', 'type'], 'lake'],
            paint: {
              'fill-color': '#3bb2d0',
              'fill-opacity': 0.6,
            },
          } as any);
        }
      } catch (error) {
        console.error('Error adding water bodies layer:', error);
      }
    } else {
      removeLayer('water-bodies-line', 'water-bodies');
      removeLayer('water-bodies-fill');
    }

    // INFRASTRUCTURE LAYER (Metro Lines)
    if (filters?.infrastructure && geoJsonData.infrastructure) {
      try {
        if (!map.getSource('infrastructure')) {
          map.addSource('infrastructure', {
            type: 'geojson',
            data: geoJsonData.infrastructure,
          } as any);
        } else {
          (map.getSource('infrastructure') as any).setData(geoJsonData.infrastructure);
        }

        // Add metro lines
        if (!map.getLayer('infrastructure-metro')) {
          map.addLayer({
            id: 'infrastructure-metro',
            type: 'line',
            source: 'infrastructure',
            filter: ['==', ['get', 'type'], 'metro'],
            paint: {
              'line-color': [
                'match',
                ['get', 'name'],
                'Blue Line', '#0066CC',
                'Yellow Line', '#FFD700',
                'Red Line', '#DC143C',
                'Green Line', '#228B22',
                'Violet Line', '#8B00FF',
                '#8b5cf6', // default
              ],
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 2,
                15, 4,
                18, 6,
              ],
              'line-opacity': 0.8,
            },
          } as any);
        }

        // Add highways
        if (!map.getLayer('infrastructure-highway')) {
          map.addLayer({
            id: 'infrastructure-highway',
            type: 'line',
            source: 'infrastructure',
            filter: ['==', ['get', 'type'], 'highway'],
            paint: {
              'line-color': '#FF8C00',
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 3,
                15, 5,
                18, 8,
              ],
              'line-opacity': 0.7,
            },
          } as any);
        }
      } catch (error) {
        console.error('Error adding infrastructure layer:', error);
      }
    } else {
      removeLayer('infrastructure-metro', 'infrastructure');
      removeLayer('infrastructure-highway');
    }

    // COMPLAINT DENSITY HEATMAP
    if (filters?.densityHeatmap) {
      try {
        // Combine all complaint GeoJSON data for heatmap
        const allComplaints = [
          ...(geoJsonData.critical?.features || []),
          ...(geoJsonData.moderate?.features || []),
          ...(geoJsonData.resolved?.features || []),
        ].map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            weight: feature.properties.priority === 'critical' ? 3 : 
                   feature.properties.priority === 'moderate' ? 2 : 1,
          },
        }));

        if (allComplaints.length > 0) {
          const heatmapData = {
            type: 'FeatureCollection' as const,
            features: allComplaints,
          };

          if (!map.getSource('density-heatmap')) {
            map.addSource('density-heatmap', {
              type: 'geojson',
              data: heatmapData,
            } as any);
          } else {
            (map.getSource('density-heatmap') as any).setData(heatmapData);
          }

          if (!map.getLayer('density-heatmap-layer')) {
            map.addLayer({
              id: 'density-heatmap-layer',
              type: 'heatmap',
              source: 'density-heatmap',
              maxzoom: 15,
              paint: {
                'heatmap-weight': ['get', 'weight'],
                'heatmap-intensity': 1.2,
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(59, 130, 246, 0)',
                  0.2, 'rgba(59, 130, 246, 0.4)',
                  0.4, 'rgba(147, 51, 234, 0.5)',
                  0.6, 'rgba(236, 72, 153, 0.6)',
                  0.8, 'rgba(239, 68, 68, 0.7)',
                  1, 'rgba(220, 38, 38, 0.9)',
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  10, 20,
                  15, 40,
                  18, 60,
                ],
                'heatmap-opacity': 0.7,
              },
            } as any);
          }
        }
      } catch (error) {
        console.error('Error adding density heatmap:', error);
      }
    } else {
      removeLayer('density-heatmap-layer', 'density-heatmap');
    }

    // Add click handlers for complaint layers
    ['critical-complaints-layer', 'moderate-complaints-layer', 'resolved-complaints-layer'].forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.off('click', layerId);
        map.on('click', layerId, (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
          if (features.length > 0) {
            const feature = features[0];
            const props = feature.properties;
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
                  <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px; font-size: 0.875rem;">
                    ${props.category || 'Complaint'}
                  </div>
                  <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 6px;">
                    ${props.description || 'No description'}
                  </div>
                  <div style="font-size: 0.75rem; color: #475569;">
                    Ward: ${props.ward || 'N/A'}
                  </div>
                </div>
              `)
              .addTo(map);
          }
        });
      }
    });
  }, [filters, isLoading, isLoadingData, geoJsonData]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
      
      {/* City Intelligence Layer */}
      {mapRef.current && (
        <CityIntelligenceLayerMaplibre map={mapRef.current} />
      )}
      
      {/* Loading overlay */}
      {(isLoading || isLoadingData) && (
        <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-slate-600">
              {isLoading ? 'Loading 3D Delhi Map...' : 'Loading civic intelligence data...'}
            </p>
            {isLoadingData && (
              <p className="text-sm text-slate-400 mt-2">Fetching real-time data from OpenCity.in</p>
            )}
          </div>
        </div>
      )}

      {/* Custom styles for MapLibre */}
      <style jsx global>{`
        .maplibregl-popup-content {
          font-family: 'Inter', system-ui, sans-serif;
        }
        .maplibregl-popup-close-button {
          color: #64748b;
          font-size: 20px;
          padding: 4px 8px;
        }
        .maplibregl-popup-close-button:hover {
          color: #0f172a;
        }
        .maplibregl-ctrl-group {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .maplibregl-ctrl button {
          color: #1e40af;
        }
        .maplibregl-ctrl button:hover {
          background: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
}
