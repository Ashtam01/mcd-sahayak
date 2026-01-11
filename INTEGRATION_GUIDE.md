# City Intelligence Layer - Integration Guide

## Overview

The City Intelligence Layer adds three sophisticated data visualizations to your Delhi 3D map:
1. **Darkness & Safety** - Broken streetlight visualization (glowing yellow circles)
2. **Flood Risk** - Waterlogging hotspots (pulsing blue zones)
3. **Live Atmosphere** - Real-time AQI overlay (smog tint)

## Installation

### Option 1: Using react-map-gl (Recommended for new maps)

If you're using `react-map-gl` (like in `City3DMap.tsx`):

```bash
cd frontend
npm install react-map-gl
```

### Option 2: Using maplibre-gl directly (For existing Delhi3DMap.tsx)

No additional installation needed - use `CityIntelligenceLayerMaplibre.tsx`

## Integration Methods

### Method 1: Integration with react-map-gl Map Component

If your map uses `react-map-gl` (like `City3DMap.tsx`):

```tsx
import Map from 'react-map-gl';
import { CityIntelligenceLayer } from '@/components/dashboard/CityIntelligenceLayer';

export default function MyMap() {
  const [viewState, setViewState] = useState({
    longitude: 77.2090,
    latitude: 28.6139,
    zoom: 11,
  });

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="your-map-style-url"
      mapLib={maplibregl}
    >
      {/* Nest CityIntelligenceLayer inside Map */}
      <CityIntelligenceLayer />
    </Map>
  );
}
```

### Method 2: Integration with maplibre-gl (Delhi3DMap.tsx)

For your existing `Delhi3DMap.tsx` that uses `maplibre-gl` directly:

**Step 1:** Import the component at the top of `Delhi3DMap.tsx`:

```tsx
import { CityIntelligenceLayerMaplibre } from '@/components/dashboard/CityIntelligenceLayerMaplibre';
```

**Step 2:** Add the component inside the return statement, after the map container:

```tsx
export function Delhi3DMap({ filters = defaultFilters }: Delhi3DMapProps) {
  // ... existing code ...

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
      
      {/* Add City Intelligence Layer */}
      <CityIntelligenceLayerMaplibre map={mapRef.current} />
      
      {/* Existing loading overlay */}
      {(isLoading || isLoadingData) && (
        // ... existing loading UI ...
      )}
    </div>
  );
}
```

**Step 3:** Make sure the map ref is passed correctly. The component will automatically update when the map loads.

## Component Features

### 1. Darkness & Safety Layer
- **Visual:** Glowing yellow circles (#FFD700) with halo effect
- **Data:** Mock broken streetlight locations
- **Interaction:** Click markers to see details
- **Status:** Critical/Reported indicators

### 2. Flood Risk Layer
- **Visual:** Pulsing blue zones (#00BFFF) with opacity animation
- **Data:** Mock waterlogging hotspots from Delhi Traffic Police
- **Interaction:** Click zones to see location names
- **Effect:** Animated pulse for attention

### 3. Live Atmosphere Layer
- **Visual:** Full-screen color overlay based on AQI
- **Data Source:** Real-time AQI from `api.waqi.info`
- **Colors:**
  - Green (0-100 AQI): Clean air
  - Orange (101-300 AQI): Moderate smog
  - Dark Red (300+ AQI): Hazardous/Toxic fog
- **Auto-refresh:** Updates every 5 minutes

## Configuration

### AQI API Token (Optional)

To use a custom AQI token instead of 'demo':

1. Create/update `.env.local`:
```bash
NEXT_PUBLIC_AQI_TOKEN=your_token_here
```

2. Get a free token from: https://aqicn.org/api/

### Customizing Data

To replace mock data with real data sources:

1. **Dark Spots:** Update `DARK_SPOTS` array in the component
2. **Flood Hotspots:** Update `FLOOD_HOTSPOTS` array in the component
3. **AQI:** Already uses real API (waqi.info)

## Styling

The component uses:
- **Glassmorphism:** `bg-white/90 backdrop-blur-xl`
- **Tailwind CSS:** All styling via utility classes
- **Icons:** Lucide React (`Lightbulb`, `Droplets`, `Wind`)

## Troubleshooting

### Layers not showing?
- Ensure the map is fully loaded before toggling layers
- Check browser console for errors
- Verify map ref is passed correctly

### AQI not loading?
- Check network tab for API errors
- Verify CORS is enabled for `api.waqi.info`
- Fallback to mock data (AQI: 150) if API fails

### Performance issues?
- Limit the number of data points
- Use clustering for large datasets
- Optimize layer rendering with `maxzoom`/`minzoom`

## Example Usage in Delhi3DMap.tsx

```tsx
'use client';

import { CityIntelligenceLayerMaplibre } from '@/components/dashboard/CityIntelligenceLayerMaplibre';

export function Delhi3DMap({ filters = defaultFilters }: Delhi3DMapProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  // ... existing code ...

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* City Intelligence Layer */}
      {mapRef.current && (
        <CityIntelligenceLayerMaplibre map={mapRef.current} />
      )}
      
      {/* Rest of your UI */}
    </div>
  );
}
```

## Next Steps

1. Replace mock data with real API endpoints
2. Add more intelligence layers (traffic, pollution, etc.)
3. Implement data clustering for better performance
4. Add time-based filtering (show data for specific dates)
