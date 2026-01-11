'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase, type Complaint } from '@/lib/supabase';
import { useZoneStore } from '@/lib/store';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Delhi center coordinates
const DELHI_CENTER: [number, number] = [28.6139, 77.2090];
const DELHI_BOUNDS: L.LatLngBoundsExpression = [
  [28.4, 76.8], // Southwest
  [28.9, 77.4], // Northeast
];

// Custom marker icons matching website theme
const createMarkerIcon = (color: string, size: 'small' | 'large' = 'small') => {
  const iconSize = size === 'large' ? [32, 32] : [24, 24];
  const iconAnchor = size === 'large' ? [16, 32] : [12, 24];
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${iconSize[0]}px;
        height: ${iconSize[1]}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px ${color}40;
        position: relative;
        animation: ${color === '#ef4444' ? 'pulse 2s infinite' : 'none'};
      ">
        ${color === '#ef4444' ? `
          <div style="
            position: absolute;
            inset: -4px;
            border: 2px solid ${color};
            border-radius: 50%;
            opacity: 0.6;
            animation: ripple 2s infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: iconSize as [number, number],
    iconAnchor: iconAnchor as [number, number],
    popupAnchor: [0, -iconAnchor[1]],
  });
};

const criticalIcon = createMarkerIcon('#ef4444', 'large');
const moderateIcon = createMarkerIcon('#f59e0b', 'small');
const resolvedIcon = createMarkerIcon('#22c55e', 'small');

interface ComplaintMarker {
  complaint: Complaint;
  marker: L.Marker;
  severity: 'critical' | 'moderate' | 'resolved';
}

export function DelhiMap({ onComplaintSelect }: { onComplaintSelect?: (complaint: Complaint) => void }) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<ComplaintMarker[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredComplaint, setHoveredComplaint] = useState<Complaint | null>(null);
  const { selectedZone } = useZoneStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let timer: NodeJS.Timeout;
    let styleElement: HTMLStyleElement | null = null;

    // Wait a tick to ensure container is fully rendered
    timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      // Create map with Delhi-focused view
      const map = L.map(mapContainerRef.current, {
        center: DELHI_CENTER,
        zoom: 11,
        minZoom: 10,
        maxZoom: 16,
        maxBounds: DELHI_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
        attributionControl: true,
      });

      // Custom tile layer - Styled to match website theme (light, clean)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Invalidate size to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Apply custom styling to match website theme
      if (!document.getElementById('delhi-map-styles')) {
        styleElement = document.createElement('style');
        styleElement.id = 'delhi-map-styles';
        styleElement.textContent = `
          .leaflet-container {
            background: #f8fafc !important;
            font-family: 'Inter', system-ui, sans-serif;
            height: 100% !important;
            width: 100% !important;
          }
          .leaflet-control-zoom a {
            background: white !important;
            color: #1e40af !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          }
          .leaflet-control-zoom a:hover {
            background: #3b82f6 !important;
            color: white !important;
          }
          .leaflet-popup-content-wrapper {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
            padding: 0;
          }
          .leaflet-popup-content {
            margin: 0;
            padding: 12px;
            font-size: 0.875rem;
          }
          .leaflet-popup-tip {
            background: white;
            border: 1px solid #e2e8f0;
          }
          .custom-marker {
            background: transparent !important;
            border: none !important;
          }
        `;
        document.head.appendChild(styleElement);
      }

      mapRef.current = map;
    }, 100);

    return () => {
      if (timer) clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const styleEl = document.getElementById('delhi-map-styles');
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  // Fetch complaints
  useEffect(() => {
    async function fetchComplaints() {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }

    fetchComplaints();

    // Real-time subscription
    const channel = supabase
      .channel('delhi-map-updates')
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

  // Update markers when complaints change
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(({ marker }) => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    complaints.forEach((complaint) => {
      if (!complaint.latitude || !complaint.longitude) return;

      // Determine severity
      let severity: 'critical' | 'moderate' | 'resolved' = 'moderate';
      if (complaint.status === 'resolved' || complaint.status === 'Resolved') {
        severity = 'resolved';
      } else if (
        complaint.priority === 'critical' ||
        complaint.priority === 'high' ||
        complaint.status === 'critical' ||
        ['Open Manhole', 'Fire Hazard', 'Flooding', 'Emergency'].includes(complaint.category || '')
      ) {
        severity = 'critical';
      }

      // Select icon based on severity
      const icon = severity === 'critical' ? criticalIcon :
                   severity === 'moderate' ? moderateIcon : resolvedIcon;

      // Create marker
      const marker = L.marker([complaint.latitude, complaint.longitude], {
        icon,
        zIndexOffset: severity === 'critical' ? 1000 : severity === 'moderate' ? 500 : 100,
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${severity === 'critical' ? '#ef4444' : severity === 'moderate' ? '#f59e0b' : '#22c55e'};
              margin-top: 4px;
              flex-shrink: 0;
            "></div>
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">
                Complaint #${complaint.id?.slice(-6) || 'N/A'}
              </div>
              <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 6px;">
                ${complaint.category || 'Unknown Category'}
              </div>
              <div style="font-size: 0.75rem; color: #475569;">
                ${complaint.location || 'Location N/A'}
              </div>
            </div>
          </div>
          <button 
            onclick="window.selectComplaint('${complaint.id}')"
            style="
              width: 100%;
              padding: 6px 12px;
              background: #1e40af;
              color: white;
              border: none;
              border-radius: 0.5rem;
              font-size: 0.75rem;
              font-weight: 600;
              cursor: pointer;
              margin-top: 8px;
              transition: background 0.2s;
            "
            onmouseover="this.style.background='#3b82f6'"
            onmouseout="this.style.background='#1e40af'"
          >
            View Details
          </button>
        </div>
      `;

      // Add popup
      marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 250,
        closeButton: true,
      });

      // Add hover tooltip
      marker.on('mouseover', () => {
        setHoveredComplaint(complaint);
      });

      marker.on('mouseout', () => {
        setHoveredComplaint(null);
      });

      // Add click handler
      marker.on('click', () => {
        if (onComplaintSelect) {
          onComplaintSelect(complaint);
        }
      });

      // Add to map
      marker.addTo(map);
      markersRef.current.push({ complaint, marker, severity });
    });

    // Expose global function for popup button clicks
    (window as any).selectComplaint = (complaintId: string) => {
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint && onComplaintSelect) {
        onComplaintSelect(complaint);
        // Close popup
        map.closePopup();
      }
    };
  }, [complaints, isLoading, onComplaintSelect]);

  return (
    <Card className="overflow-hidden border-slate-200 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <CardTitle className="text-lg">Delhi Civic Intelligence Map</CardTitle>
          </div>
          {isLoading && (
            <RefreshCw className="w-4 h-4 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Resolved</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div 
          className="h-[400px] w-full bg-slate-50 relative" 
          ref={mapContainerRef}
          style={{ minHeight: '400px', width: '100%' }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-[1000]">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-600">Loading Delhi map...</p>
              </div>
            </div>
          )}
        </div>
        {hoveredComplaint && (
          <div className="absolute bottom-20 left-4 right-4 z-[1000] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-xl max-w-md mx-auto">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">
                    Complaint #{hoveredComplaint.id?.slice(-6) || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 truncate">
                    {hoveredComplaint.category || 'Unknown Category'} • {hoveredComplaint.location || 'Location N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            {complaints.length} active complaints • Pan and zoom to explore Delhi • Click markers for details
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
