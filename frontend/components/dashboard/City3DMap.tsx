'use client';

import { useState } from 'react';
import Map, { NavigationControl, Marker, Popup, FullscreenControl } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'; // Important: Import the CSS
import { Card } from '@/components/ui/card';
import { AlertTriangle, Zap, MapPin } from 'lucide-react';

export default function City3DMap() {
  const [viewState, setViewState] = useState({
    longitude: 77.1025, // Center of Delhi
    latitude: 28.7041,
    zoom: 11,
    pitch: 50, // Tilt for 3D effect
    bearing: 0,
  });
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  // Mock Data Points (Complaints)
  const pins = [
    { id: 1, lat: 28.7041, long: 77.1025, severity: 'high', type: 'Sanitation' },
    { id: 2, lat: 28.6139, long: 77.2090, severity: 'medium', type: 'Water' },
    { id: 3, lat: 28.5355, long: 77.3910, severity: 'critical', type: 'Road' },
  ];

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 relative shadow-2xl bg-slate-900">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        // FREE DARK THEME TILES (No Token Needed)
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        mapLib={maplibregl} 
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />

        {/* Render Interactive Pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            longitude={pin.long}
            latitude={pin.lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setHoverInfo(pin);
            }}
          >
            <div className={`
              cursor-pointer transform transition-transform hover:scale-125
              ${pin.severity === 'critical' ? 'text-red-500' : pin.severity === 'high' ? 'text-orange-500' : 'text-blue-500'}
            `}>
              <div className="relative group">
                 {/* Glowing Pulse */}
                 <div className="w-4 h-4 bg-current rounded-full shadow-[0_0_15px_currentColor]"></div>
                 <div className="absolute -top-1 -left-1 w-6 h-6 border-2 border-current rounded-full animate-ping opacity-75"></div>
                 {/* 3D Stem Effect */}
                 <div className="absolute top-2 left-1.5 w-0.5 h-8 bg-gradient-to-b from-current to-transparent opacity-50"></div>
              </div>
            </div>
          </Marker>
        ))}

        {/* Tooltip Popup */}
        {hoverInfo && (
          <Popup
            anchor="top"
            longitude={hoverInfo.long}
            latitude={hoverInfo.lat}
            onClose={() => setHoverInfo(null)}
            className="text-slate-900"
            closeButton={false}
            closeOnClick={false}
          >
            <div className="p-3 min-w-[160px] bg-white rounded-lg shadow-xl">
              <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-bold text-sm text-slate-800">Incident Detected</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mb-2">{hoverInfo.type} Issue</p>
              <div className="flex gap-2">
                 <button 
                    className="flex-1 text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded transition-colors"
                    onClick={() => alert(`Dispatching drone to Sector ${hoverInfo.id}...`)}
                 >
                    Dispatch Drone
                 </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating HUD Overlay (Command Center UI) */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <Card className="bg-slate-900/90 backdrop-blur-md border-slate-700 p-4 text-white w-64 shadow-2xl">
           <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Live City Feed</h3>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between text-sm items-center border-b border-slate-800 pb-2">
                 <span className="text-slate-400">Active Sensors</span>
                 <span className="font-mono text-blue-400 font-bold">4,203</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                 <span className="text-slate-400">Grid Status</span>
                 <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">OPTIMAL</span>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}