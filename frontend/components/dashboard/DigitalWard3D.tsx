'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase, type Complaint } from '@/lib/supabase';
import { useZoneStore } from '@/lib/store';

// Types
interface ComplaintMarker {
  id: string;
  x: number;
  z: number;
  complaint: Complaint;
  severity: 'critical' | 'moderate' | 'resolved';
}

interface Building {
  x: number;
  z: number;
  height: number;
}

// Procedural City Generator
function generateCityBlocks(count: number = 50): Building[] {
  const buildings: Building[] = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  const spacing = 2.5;
  const startX = -(gridSize * spacing) / 2;
  const startZ = -(gridSize * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const x = startX + col * spacing + (Math.random() - 0.5) * 0.5;
    const z = startZ + row * spacing + (Math.random() - 0.5) * 0.5;
    const height = 0.5 + Math.random() * 2; // Varying heights for density

    buildings.push({ x, z, height });
  }

  return buildings;
}

// Building Component
function BuildingBlock({ position, height }: { position: [number, number, number]; height: number }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1.5, height, 1.5]} />
      <meshStandardMaterial
        color="#e2e8f0"
        metalness={0.1}
        roughness={0.8}
        emissive="#f1f5f9"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// Ground Grid
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>
      {/* Grid lines */}
      <gridHelper args={[100, 50, '#1e293b', '#1e293b']} position={[0, 0.01, 0]} />
    </>
  );
}

// Complaint Marker Component
function ComplaintMarker({ marker, onHover, onLeave, onClick }: {
  marker: ComplaintMarker;
  onHover: (marker: ComplaintMarker) => void;
  onLeave: () => void;
  onClick: (marker: ComplaintMarker) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Pulse animation for critical complaints
  useFrame((state) => {
    if (meshRef.current && marker.severity === 'critical') {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = marker.severity === 'critical' ? '#ef4444' : 
                marker.severity === 'moderate' ? '#f59e0b' : '#22c55e';
  
  const height = marker.severity === 'critical' ? 3 : 
                 marker.severity === 'moderate' ? 2 : 0.3;

  return (
    <group
      position={[marker.x, height / 2, marker.z]}
      onPointerOver={() => {
        setHovered(true);
        onHover(marker);
      }}
      onPointerOut={() => {
        setHovered(false);
        onLeave();
      }}
      onClick={() => onClick(marker)}
    >
      {/* Main pillar/sphere */}
      <mesh ref={meshRef} castShadow>
        {marker.severity === 'resolved' ? (
          <cylinderGeometry args={[0.3, 0.3, height, 8]} />
        ) : (
          <sphereGeometry args={[0.4, 16, 16]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      
      {/* Glow effect for critical */}
      {marker.severity === 'critical' && (
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.2}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Stem/base for non-resolved */}
      {marker.severity !== 'resolved' && (
        <mesh position={[0, -height / 2 - 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      )}
    </group>
  );
}

// Tooltip Component
function ComplaintTooltip({ marker, position }: { marker: ComplaintMarker | null; position: { x: number; y: number } }) {
  if (!marker) return null;

  return (
    <Html position={[marker.x, 4, marker.z]} center>
      <div className="bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl border border-slate-700 min-w-[200px]">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              Complaint #{marker.complaint.id?.slice(-6) || 'N/A'}
            </p>
            <p className="text-xs text-slate-300 mt-1 truncate">
              {marker.complaint.category || 'Unknown Category'}
            </p>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {marker.complaint.location || 'Location N/A'}
            </p>
          </div>
        </div>
      </div>
    </Html>
  );
}

// Main 3D Scene
function Scene({ 
  buildings, 
  markers, 
  onMarkerHover, 
  onMarkerLeave, 
  onMarkerClick,
  hoveredMarker 
}: {
  buildings: Building[];
  markers: ComplaintMarker[];
  onMarkerHover: (marker: ComplaintMarker) => void;
  onMarkerLeave: () => void;
  onMarkerClick: (marker: ComplaintMarker) => void;
  hoveredMarker: ComplaintMarker | null;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.3} />

      {/* Ground */}
      <Ground />

      {/* City Blocks */}
      {buildings.map((building, index) => (
        <BuildingBlock
          key={index}
          position={[building.x, building.height / 2, building.z]}
          height={building.height}
        />
      ))}

      {/* Complaint Markers */}
      {markers.map((marker) => (
        <ComplaintMarker
          key={marker.id}
          marker={marker}
          onHover={onMarkerHover}
          onLeave={onMarkerLeave}
          onClick={onMarkerClick}
        />
      ))}

      {/* Tooltip */}
      <ComplaintTooltip marker={hoveredMarker} position={{ x: 0, y: 0 }} />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

// Main Component
export function DigitalWard3D({ onComplaintSelect }: { onComplaintSelect?: (complaint: Complaint) => void }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMarker, setHoveredMarker] = useState<ComplaintMarker | null>(null);
  const { selectedZone } = useZoneStore();

  // Generate procedural city
  const buildings = useMemo(() => generateCityBlocks(60), []);

  // Fetch complaints
  useEffect(() => {
    async function fetchComplaints() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

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

    // Set up real-time subscription
    const channel = supabase
      .channel('digital-ward-updates')
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

  // Map complaints to 3D markers
  const markers = useMemo<ComplaintMarker[]>(() => {
    if (!complaints.length) return [];

    // Distribute complaints across the city grid
    const gridSize = Math.ceil(Math.sqrt(buildings.length));
    const spacing = 2.5;
    const startX = -(gridSize * spacing) / 2;
    const startZ = -(gridSize * spacing) / 2;

    return complaints.map((complaint, index) => {
      // Use complaint location if available, otherwise distribute evenly
      let x = 0, z = 0;
      
      if (complaint.latitude && complaint.longitude) {
        // Normalize coordinates to fit our abstract space
        // Delhi roughly: 28.4-28.9 lat, 76.8-77.4 lng
        const normalizedLat = ((complaint.latitude - 28.4) / 0.5) * 20 - 10;
        const normalizedLng = ((complaint.longitude - 76.8) / 0.6) * 20 - 10;
        x = normalizedLng;
        z = normalizedLat;
      } else {
        // Distribute evenly across grid
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        x = startX + col * spacing + (Math.random() - 0.5) * 1;
        z = startZ + row * spacing + (Math.random() - 0.5) * 1;
      }

      // Determine severity based on priority and status
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

      return {
        id: complaint.id,
        x,
        z,
        complaint,
        severity,
      };
    });
  }, [complaints, buildings]);

  const handleMarkerHover = (marker: ComplaintMarker) => {
    setHoveredMarker(marker);
  };

  const handleMarkerLeave = () => {
    setHoveredMarker(null);
  };

  const handleMarkerClick = (marker: ComplaintMarker) => {
    if (onComplaintSelect) {
      onComplaintSelect(marker.complaint);
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <CardTitle className="text-lg">Digital Ward - Command Center</CardTitle>
          </div>
          {isLoading && (
            <RefreshCw className="w-4 h-4 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
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
      <CardContent className="p-0">
        <div className="h-[400px] w-full bg-slate-950 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-400">Loading Digital Ward...</p>
              </div>
            </div>
          ) : (
            <Canvas
              camera={{ position: [15, 15, 15], fov: 50 }}
              shadows
              gl={{ antialias: true, alpha: true }}
            >
              <Scene
                buildings={buildings}
                markers={markers}
                onMarkerHover={handleMarkerHover}
                onMarkerLeave={handleMarkerLeave}
                onMarkerClick={handleMarkerClick}
                hoveredMarker={hoveredMarker}
              />
            </Canvas>
          )}
        </div>
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            {markers.length} active complaints • Hover for details • Click to view full report
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
